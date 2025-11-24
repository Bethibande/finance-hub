package de.bethibande.finance.web.api.v1;

import de.bethibande.finance.model.jpa.Asset;
import de.bethibande.finance.model.jpa.Workspace;
import de.bethibande.finance.web.api.v1.crud.AbstractCRUDEndpoint;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.panache.common.Sort;
import jakarta.ws.rs.*;

@Path("/api/v1/workspace")
public class WorkspaceEndpoint extends AbstractCRUDEndpoint<Workspace> {

    @Override
    protected PanacheQuery<Workspace> find(final String query, final Object... params) {
        return Workspace.find(query, params);
    }

    @Override
    protected PanacheQuery<Workspace> list(final Sort sort) {
        return Workspace.findAll(sort);
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
