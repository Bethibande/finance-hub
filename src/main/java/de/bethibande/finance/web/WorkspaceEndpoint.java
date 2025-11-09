package de.bethibande.finance.web;

import de.bethibande.finance.model.jpa.Asset;
import de.bethibande.finance.model.jpa.Depot;
import de.bethibande.finance.model.jpa.Workspace;
import de.bethibande.finance.security.Roles;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import jakarta.annotation.security.RolesAllowed;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;

import java.util.List;

@Path("/api/v1/workspace")
public class WorkspaceEndpoint extends AbstractCRUDEndpoint<Workspace> {

    @Override
    protected PanacheQuery<Workspace> find(final String query, final Object... params) {
        return Workspace.find(query, params);
    }

    @Override
    protected PanacheQuery<Workspace> list() {
        return Workspace.findAll();
    }

    @Override
    protected void deleteById(final long id) {
        Workspace.deleteById(id);
    }

    @Override
    protected boolean hasDependents(final long id) {
        // All workspace-bound entities directly or indirectly depend on an asset, if there are no assets, then the workspace is empty
        return Asset.find("workspace.id = ?1", id).count() > 0;
    }
}
