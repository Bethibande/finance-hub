package de.bethibande.finance.model.jpa.transaction;

import com.fasterxml.jackson.annotation.JsonFormat;
import de.bethibande.finance.model.jpa.Asset;
import de.bethibande.finance.model.jpa.Depot;
import de.bethibande.finance.model.jpa.WorkspaceEntity;
import de.bethibande.finance.model.jpa.partner.Partner;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
public class Transaction extends WorkspaceEntity {

    @Column(nullable = false)
    public String name;

    @Column(nullable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    public BigDecimal amount;

    @ManyToOne(optional = false)
    public Asset asset;

    @Column(nullable = false)
    public LocalDate date;

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
    public Transaction internalRef;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    public TransactionType type;

    @ManyToOne(optional = false)
    public Depot depot;

}
