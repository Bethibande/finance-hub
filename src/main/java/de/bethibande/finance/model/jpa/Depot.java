package de.bethibande.finance.model.jpa;

import de.bethibande.finance.model.jpa.partner.Partner;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;

@Entity
public class Depot extends WorkspaceEntity {

    @Column(nullable = false)
    public String name;

    @Column
    public String notes;

    @ManyToOne
    public Partner provider;

    @ManyToOne
    public Asset asset;

}
