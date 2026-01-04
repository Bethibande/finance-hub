package de.bethibande.finance.model.jpa.recurring;

import com.bethibande.process.annotation.EntityDTO;
import com.bethibande.process.annotation.VirtualDTOField;
import com.cronutils.model.Cron;
import com.cronutils.model.definition.CronDefinition;
import com.cronutils.model.definition.CronDefinitionBuilder;
import com.cronutils.model.time.ExecutionTime;
import com.cronutils.parser.CronParser;
import de.bethibande.finance.model.jpa.discriminator.EntitySource;
import de.bethibande.finance.model.jpa.discriminator.SourceDiscriminators;
import de.bethibande.finance.model.jpa.transaction.AbstractPayment;
import de.bethibande.finance.model.jpa.transaction.Transaction;
import de.bethibande.finance.model.jpa.transaction.TransactionComponents;
import de.bethibande.finance.model.jpa.transaction.TransactionStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Entity
@EntityDTO(excludeProperties = {"id", "lastTransactionDate"}, name = "RecurringPaymentDTOWithoutId")
@EntityDTO(excludeProperties = {"lastTransactionDate"}, expandProperties = {"asset", "partner", "wallet"}, name = "RecurringPaymentDTO")
@EntityDTO(excludeProperties = {"lastTransactionDate", "workspace"}, name = "RecurringPaymentDTOWithoutWorkspace")
public class RecurringPayment extends AbstractPayment implements EntitySource {

    public static void deleteAllOpenScheduledPayments(final long id) {
        Transaction.delete(
                "sourceDiscriminator = ?1 AND sourceId = ?2 AND size(bookedAmounts) = 0 AND status = ?3",
                SourceDiscriminators.RECURRING_PAYMENTS,
                id,
                TransactionStatus.OPEN
        );

        Transaction.update( // Detach any remaining transactions
                "sourceDiscriminator = NULL, sourceId = NULL WHERE sourceDiscriminator = ?1 AND sourceId = ?2",
                SourceDiscriminators.RECURRING_PAYMENTS,
                id
        );
    }

    public static CronDefinition cronDefinition() {
        return CronDefinitionBuilder.defineCron()
                .withSeconds().and()
                .withMinutes().and()
                .withHours().and()
                .withDayOfMonth().and()
                .withMonth().and()
                .withDayOfWeek().withMondayDoWValue(1).and()
                .instance();
    }

    @Column(nullable = false)
    public String cronSchedule;

    @Column
    public Instant notBefore;

    @Column
    public Instant notAfter;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    public RecurringPaymentStatus status;

    @Column
    public Instant lastTransactionDate;

    @Override
    public Long getId() {
        return id;
    }

    @Override
    public int getDiscriminator() {
        return SourceDiscriminators.RECURRING_PAYMENTS;
    }

    @VirtualDTOField
    public Instant nextPaymentDate() {
        final CronParser parser = new CronParser(cronDefinition());
        final Cron cron = parser.parse(this.cronSchedule);

        final ExecutionTime time = ExecutionTime.forCron(cron);
        final Instant instant = time.nextExecution(ZonedDateTime.now())
                .map(ZonedDateTime::toInstant)
                .orElse(null);

        if (instant == null) return null;
        if (this.notBefore != null && instant.isBefore(this.notBefore)) return null;
        if (this.notAfter != null && instant.isAfter(this.notAfter)) return null;

        return instant;
    }

    public Transaction createPaymentAt(final Instant date) {
        final Transaction transaction = new Transaction();
        transaction.name = this.name;
        transaction.date = date;
        transaction.amount = this.amount;
        transaction.asset = this.asset;
        transaction.wallet = this.wallet;
        transaction.partner = this.partner;
        transaction.type = this.type;
        transaction.status = TransactionStatus.OPEN;
        transaction.workspace = this.workspace;
        transaction.setSource(this);

        return transaction;
    }

    protected Instant getStartDate(final Instant now) {
        if (this.notBefore != null && this.notBefore.isAfter(now)) return this.notBefore.minus(1, ChronoUnit.MINUTES);
        return this.lastTransactionDate != null ? this.lastTransactionDate : now;
    }

    protected Instant getEndDate(final Instant now) {
        final Instant limit = now.plus(365, ChronoUnit.DAYS);

        if (this.notAfter != null && this.notAfter.isBefore(limit)) return this.notAfter;
        return limit;
    }

    public List<Transaction> generatePayments(final Instant now, final boolean updateLastTransactionDate) {
        if (this.status == RecurringPaymentStatus.CANCELLED || this.status == RecurringPaymentStatus.SUSPENDED) {
            return Collections.emptyList();
        }

        final CronParser parser = new CronParser(RecurringPayment.cronDefinition());
        final Cron cron = parser.parse(this.cronSchedule);
        final ExecutionTime executionTime = ExecutionTime.forCron(cron);

        final List<Transaction> payments = new ArrayList<>();

        final ZoneId zone = ZoneId.systemDefault();
        final ZonedDateTime endDate = getEndDate(now).atZone(zone);
        ZonedDateTime currentDate = getStartDate(now).atZone(zone);
        while (true) {
            currentDate = executionTime.nextExecution(currentDate).orElse(null);
            if (currentDate == null || currentDate.isAfter(endDate)) break;

            payments.add(createPaymentAt(currentDate.toInstant()));
        }

        if (updateLastTransactionDate
                && !payments.isEmpty()
                && (lastTransactionDate == null || payments.getLast().date.isAfter(this.lastTransactionDate))) {
            this.lastTransactionDate = payments.getLast().date;
        }

        return payments;
    }

    public record PaymentUpdateResult(
            List<Transaction> delete,
            List<Transaction> create
    ) {
    }

    public PaymentUpdateResult updatePayments(final Instant now, final boolean forceUpdate) {
        final List<Transaction> pendingTransactions = listPendingPayments(now);

        final Set<Instant> retainedDates = new HashSet<>();
        final List<Transaction> purgedTransactions = forceUpdate ? pendingTransactions : new ArrayList<>();
        if (!forceUpdate) {
            for (int i = 0; i < pendingTransactions.size(); i++) {
                final Transaction tx = pendingTransactions.get(i);
                if (tx.get(TransactionComponents.USER_MODIFIED, false)) {
                    retainedDates.add(tx.date);
                } else {
                    purgedTransactions.add(tx);
                }
            }
        }

        this.lastTransactionDate = null;
        final List<Transaction> newTransactions = generatePayments(now, true)
                .stream()
                .filter(tx -> !retainedDates.contains(tx.date))
                .toList();

        return new PaymentUpdateResult(
                purgedTransactions,
                newTransactions
        );
    }

    public List<Transaction> listPendingPayments(final Instant now) {
        return Transaction.list(
                "date > ?1 AND sourceDiscriminator = ?2 AND sourceId = ?3 AND size(bookedAmounts) = 0",
                now,
                SourceDiscriminators.RECURRING_PAYMENTS,
                id
        );
    }

}
