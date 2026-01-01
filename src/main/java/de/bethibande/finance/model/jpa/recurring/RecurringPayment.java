package de.bethibande.finance.model.jpa.recurring;

import com.bethibande.process.annotation.EntityDTO;
import de.bethibande.finance.model.jpa.transaction.AbstractPayment;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import java.time.Instant;

@Entity
@EntityDTO(excludeProperties = {"id", "lastTransactionDate"}, name = "RecurringPaymentDTOWithoutId")
@EntityDTO(excludeProperties = {"lastTransactionDate"}, expandProperties = {"asset", "partner", "wallet"}, name = "RecurringPaymentDTO")
@EntityDTO(excludeProperties = {"lastTransactionDate", "workspace"}, name = "RecurringPaymentDTOWithoutWorkspace")
public class RecurringPayment extends AbstractPayment {

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

}
