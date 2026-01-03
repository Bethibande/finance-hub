package de.bethibande.finance.model.jpa.recurring;

import com.bethibande.process.annotation.EntityDTO;
import com.bethibande.process.annotation.VirtualDTOField;
import com.cronutils.model.Cron;
import com.cronutils.model.definition.CronDefinition;
import com.cronutils.model.definition.CronDefinitionBuilder;
import com.cronutils.model.time.ExecutionTime;
import com.cronutils.parser.CronParser;
import de.bethibande.finance.model.jpa.transaction.AbstractPayment;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import java.time.Instant;
import java.time.ZonedDateTime;

@Entity
@EntityDTO(excludeProperties = {"id", "lastTransactionDate"}, name = "RecurringPaymentDTOWithoutId")
@EntityDTO(excludeProperties = {"lastTransactionDate"}, expandProperties = {"asset", "partner", "wallet"}, name = "RecurringPaymentDTO")
@EntityDTO(excludeProperties = {"lastTransactionDate", "workspace"}, name = "RecurringPaymentDTOWithoutWorkspace")
public class RecurringPayment extends AbstractPayment {

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

    @VirtualDTOField
    public Instant nextPaymentDate() {
        final CronParser parser = new CronParser(cronDefinition());
        final Cron cron = parser.parse(this.cronSchedule);

        final ExecutionTime time = ExecutionTime.forCron(cron);
        return time.nextExecution(ZonedDateTime.now())
                .map(ZonedDateTime::toInstant)
                .orElse(null);
    }

}
