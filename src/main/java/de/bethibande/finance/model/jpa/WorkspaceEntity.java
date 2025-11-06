package de.bethibande.finance.model.jpa;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MappedSuperclass;

@MappedSuperclass
public class WorkspaceEntity extends PanacheEntity {

    @ManyToOne(optional = false)
    public Workspace workspace;

}
