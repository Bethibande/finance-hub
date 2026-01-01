package de.bethibande.finance.model.jpa.transaction;

import com.bethibande.process.annotation.EntityDTO;
import com.fasterxml.jackson.annotation.JsonIncludeProperties;
import de.bethibande.finance.model.jpa.Asset;
import de.bethibande.finance.model.jpa.Wallet;
import de.bethibande.finance.model.jpa.WorkspaceEntity;
import de.bethibande.finance.model.jpa.partner.Partner;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Entity
@EntityDTO(excludeProperties = "bookedAmounts")
@EntityDTO(excludeProperties = {"id", "bookedAmounts"})
@EntityDTO(excludeProperties = {"workspace", "bookedAmounts"})
@EntityDTO(excludeProperties = {"bookedAmounts"}, expandProperties = {"asset", "partner", "wallet"}, name = "TransactionDTOExpanded")
public class Transaction extends AbstractPayment {

    @Column(nullable = false)
    public Instant date;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    public TransactionStatus status;

    @OneToMany(mappedBy = "transaction")
    public List<BookedAmount> bookedAmounts;

    @ManyToOne
    @JsonIncludeProperties("id")
    public Transaction internalRef;

}
