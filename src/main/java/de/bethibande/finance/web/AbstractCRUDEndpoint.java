package de.bethibande.finance.web;

import de.bethibande.finance.model.web.ErrorResponse;
import de.bethibande.finance.model.web.PagedResponse;
import de.bethibande.finance.security.Roles;
import io.quarkus.hibernate.orm.panache.PanacheEntity;
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
public abstract class AbstractCRUDEndpoint<T extends PanacheEntity> {

    @Inject
    protected EntityManager entityManager;

    @POST
    @Transactional
    @RolesAllowed(Roles.USER)
    public T persist(final T asset) {
        if (asset.id != null) {
            return entityManager.merge(asset);
        }
        asset.persist();
        return asset;
    }

    protected abstract PanacheQuery<T> find(final String query, final Object... params);

    protected abstract PanacheQuery<T> list();

    protected abstract void deleteById(final long id);

    @GET
    @Transactional
    @RolesAllowed(Roles.USER)
    public PagedResponse<T> list(final @QueryParam("page") @DefaultValue("0") @Min(0) int page,
                                 final @QueryParam("size") @DefaultValue("50") @Min(1) @Max(500) int size) {
        final PanacheQuery<T> query = list().page(page, size);
        return PagedResponse.of(page, size, query);
    }

    @GET
    @Transactional
    @Path("/{id}")
    @RolesAllowed(Roles.USER)
    public T get(final @PathParam("id") long id) {
        return find("id = ?1", id).firstResult();
    }

    protected abstract boolean hasDependents(final long id);

    @DELETE
    @Path("/{id}")
    @Transactional
    @RolesAllowed(Roles.USER)
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