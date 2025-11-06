package de.bethibande.finance.model.jpa;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;

@Entity
public class Workspace extends PanacheEntity {

    @Column(nullable = false)
    public String name;

}
