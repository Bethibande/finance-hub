package de.bethibande.finance.web;

import de.bethibande.finance.model.jpa.Asset;
import de.bethibande.finance.model.jpa.Depot;
import de.bethibande.finance.model.jpa.ExchangeRate;
import de.bethibande.finance.model.jpa.transaction.BookedAmount;
import de.bethibande.finance.model.jpa.transaction.Transaction;
import de.bethibande.finance.model.web.ErrorResponse;
import de.bethibande.finance.security.Roles;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/api/v1/asset")
public class AssetEndpoint {

    @Inject
    protected EntityManager entityManager;

    @POST
    @Transactional
    @RolesAllowed(Roles.USER)
    public Asset persist(final Asset asset) {
        if (asset.id != null) {
            return entityManager.merge(asset);
        }
        asset.persist();
        return asset;
    }

    @GET
    @Transactional
    @RolesAllowed(Roles.USER)
    @Path("/workspace/{workspace}")
    public List<Asset> listByWorkspace(final @PathParam("workspace") long workspace,
                                       final @QueryParam("page") @DefaultValue("0") @Min(0) int page,
                                       final @QueryParam("size") @DefaultValue("50") @Min(1) @Max(500) int size) {
        return Asset.find("workspace.id = ?1", workspace)
                .page(page, size)
                .list();
    }

    @GET
    @Transactional
    @Path("/{id}")
    @RolesAllowed(Roles.USER)
    public Asset get(final @PathParam("id") long id) {
        return Asset.findById(id);
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    @RolesAllowed(Roles.USER)
    public Response delete(final @PathParam("id") long id) {
        boolean canDelete = true;

        if (Depot.count("asset.id = ?1", id) > 0) canDelete = false;
        if (Transaction.count("asset.id = ?1", id) > 0) canDelete = false;
        if (BookedAmount.count("asset.id = ?1", id) > 0) canDelete = false;
        if (ExchangeRate.count("base.id = ?1 OR quote.id = ?1", id) > 0) canDelete = false;

        if (!canDelete) {
            return Response.status(Response.Status.CONFLICT)
                    .entity(new ErrorResponse(409, "Cannot delete asset", "error.asset.deletable"))
                    .build();
        }

        Asset.deleteById(id);
        return Response.ok().build();
    }
}
