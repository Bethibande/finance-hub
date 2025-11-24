package de.bethibande.finance.web.api.v1.crud;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.bethibande.finance.model.web.ErrorResponse;
import de.bethibande.finance.model.web.PagedResponse;
import de.bethibande.finance.security.Roles;
import io.quarkus.hibernate.orm.panache.PanacheEntity;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.panache.common.Sort;
import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Response;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@RunOnVirtualThread
@RolesAllowed({Roles.USER, Roles.ADMIN})
public abstract class AbstractCRUDEndpoint<T extends PanacheEntity> {

    public static Sort toSort(final List<String> sortJson, final ObjectMapper objectMapper) throws JsonProcessingException {
        final List<CRUDSortOrder> sortOrders = sortJson.isEmpty() ? Collections.emptyList() : new ArrayList<>();
        if (!sortJson.isEmpty()) {
            for (final String json : sortJson) {
                sortOrders.add(objectMapper.readValue(json, CRUDSortOrder.class));
            }
        }

        final Sort sort = Sort.empty();
        for (final CRUDSortOrder order : sortOrders) {
            sort.and(
                    order.field(),
                    order.direction(),
                    order.direction() == Sort.Direction.Descending
                            ? Sort.NullPrecedence.NULLS_LAST
                            : Sort.NullPrecedence.NULLS_FIRST
            );
        }

        return sort;
    }

    @Inject
    protected EntityManager entityManager;

    @Inject
    protected ObjectMapper objectMapper;

    protected void persistEntity(final T entity) {
        entity.persist();
    }

    @POST
    @Transactional
    public T persist(final T entity) {
        if (entity.id != null) {
            return entityManager.merge(entity);
        }
        persistEntity(entity);
        return entity;
    }

    protected abstract PanacheQuery<T> find(final String query, final Object... params);

    protected abstract PanacheQuery<T> list(final Sort sort);

    protected abstract void deleteById(final long id);

    @GET
    @Transactional
    public PagedResponse<T> list(final @QueryParam("sort[]") List<String> sortJson,
                                 final @QueryParam("page") @DefaultValue("0") @Min(0) int page,
                                 final @QueryParam("size") @DefaultValue("50") @Min(1) @Max(500) int size) throws JsonProcessingException {
        final Sort sort = toSort(sortJson, objectMapper);

        final PanacheQuery<T> query = list(sort).page(page, size);
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