package de.bethibande.finance.model.jpa;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MappedSuperclass;

/**
 * Base class for entities that are associated with a specific workspace.
 * <br>
 * The WorkspaceEntity is a shared base entity that establishes a reference to a {@link Workspace}.
 * Entities extending WorkspaceEntity inherit this relationship and are automatically bound
 * to a specific workspace in the application. This class serves as the foundation for defining
 * workspace-specific entities and ensures consistent data scoping.
 */
@MappedSuperclass
public class WorkspaceEntity extends PanacheEntity {

    @ManyToOne(optional = false)
    public Workspace workspace;

}
