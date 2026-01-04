package de.bethibande.finance.jobs.impl;

import de.bethibande.finance.jobs.JobContext;
import de.bethibande.finance.jobs.JobTask;
import de.bethibande.finance.model.jpa.recurring.RecurringPayment;
import de.bethibande.finance.model.jpa.recurring.RecurringPaymentStatus;
import de.bethibande.finance.model.jpa.transaction.Transaction;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@ApplicationScoped
public class UpdateRecurringPaymentsTask implements JobTask<Object> {

    @Override
    public String getTaskIdentifier() {
        return "update_recurring_payments";
    }

    @Override
    public Class<Object> getConfigType() {
        return Object.class;
    }

    @Override
    @Transactional
    public CompletableFuture<Void> execute(final JobContext<Object> ctx) {
        final Instant now = Instant.now();
        RecurringPayment.<RecurringPayment>stream("workspace.id = ?1 AND status = ?2", ctx.getWorkspace().id, RecurringPaymentStatus.ACTIVE).forEach(payment -> {
            if (payment.notAfter != null && now.isAfter(payment.notAfter)) {
                payment.status = RecurringPaymentStatus.EXPIRED;
                return;
            }

            final List<Transaction> transactions = payment.generatePayments(now, true);
            Transaction.persist(transactions);
        });

        ctx.reschedule("0 0 1 * * *");

        return CompletableFuture.completedFuture(null);
    }
}
