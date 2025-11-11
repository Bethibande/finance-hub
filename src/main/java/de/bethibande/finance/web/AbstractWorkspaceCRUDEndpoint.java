package de.bethibande.finance.web;

import de.bethibande.finance.model.jpa.WorkspaceEntity;
import de.bethibande.finance.model.web.ErrorResponse;
import de.bethibande.finance.model.web.PagedResponse;
import de.bethibande.finance.security.Roles;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Response;

@RunOnVirtualThread
@RolesAllowed({Roles.USER, Roles.ADMIN})
public abstract class AbstractWorkspaceCRUDEndpoint<T extends WorkspaceEntity> {

    @Inject
    protected EntityManager entityManager;

    @POST
    @Transactional
    public T persist(final T asset) {
        if (asset.id != null) {
            return entityManager.merge(asset);
        }
        asset.persist();
        return asset;
    }

    protected abstract PanacheQuery<T> find(final String query, final Object... params);

    protected abstract void deleteById(final long id);

    @GET
    @Transactional

    @Path("/workspace/{workspace}")
    public PagedResponse<T> listByWorkspace(final @PathParam("workspace") long workspace,
                                            final @QueryParam("page") @DefaultValue("0") @Min(0) int page,
                                            final @QueryParam("size") @DefaultValue("50") @Min(1) @Max(500) int size) {
        final PanacheQuery<T> query = find("workspace.id = ?1", workspace)
                .page(page, size);

        return PagedResponse.of(page, size, query);
    }

    @GET
    @Transactional
    @Path("/{id}")
    public T get(final @PathParam("id") long id) {
        return find("id = ?1", id).firstResult();
    }

    protected abstract boolean hasDependents(final long id);

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(final @PathParam("id") long id) {
        if (hasDependents(id)) {
            return Response.status(Response.Status.CONFLICT)
                    .entity(new ErrorResponse(409, "Cannot delete entity with dependent resources", "error.delete.dependents"))
                    .build();
        }

        deleteById(id);
        return Response.ok().build();
    }

}
