package de.bethibande.finance.model.jpa.transaction;

import com.bethibande.process.annotation.EntityDTO;
import com.fasterxml.jackson.annotation.JsonIncludeProperties;
import de.bethibande.finance.model.jpa.Asset;
import de.bethibande.finance.model.jpa.Wallet;
import de.bethibande.finance.model.jpa.WorkspaceEntity;
import de.bethibande.finance.model.jpa.partner.Partner;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Entity
@EntityDTO(excludeProperties = "bookedAmounts")
@EntityDTO(excludeProperties = {"id", "bookedAmounts"})
@EntityDTO(excludeProperties = {"workspace", "bookedAmounts"})
@EntityDTO(excludeProperties = {"bookedAmounts"}, expandProperties = {"asset", "partner", "wallet"}, name = "TransactionDTOExpanded")
public class Transaction extends WorkspaceEntity {

    @Column(nullable = false)
    public String name;

    @Column(nullable = false)
    public BigDecimal amount;

    @ManyToOne(optional = false)
    public Asset asset;

    @Column(nullable = false)
    public OffsetDateTime date;

    @Column
    public String notes;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    public TransactionStatus status;

    @OneToMany(mappedBy = "transaction")
    public List<BookedAmount> bookedAmounts;

    @ManyToOne
    public Partner partner;

    @ManyToOne
    @JsonIncludeProperties("id")
    public Transaction internalRef;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    public TransactionType type;

    @ManyToOne(optional = false)
    public Wallet wallet;

}
