package de.bethibande.finance.model.jpa.transaction;

import de.bethibande.finance.model.jpa.Asset;
import de.bethibande.finance.model.jpa.Wallet;
import de.bethibande.finance.model.jpa.WorkspaceEntity;
import de.bethibande.finance.model.jpa.partner.Partner;
import jakarta.persistence.*;

import java.math.BigDecimal;

@MappedSuperclass
public abstract class AbstractPayment extends WorkspaceEntity {

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    public TransactionType type;

    @ManyToOne(optional = false)
    public Wallet wallet;

    @ManyToOne
    public Partner partner;

    @Column(nullable = false)
    public String name;

    @Column(nullable = false)
    public BigDecimal amount;

    @ManyToOne(optional = false)
    public Asset asset;

    @Column
    public String notes;

}
