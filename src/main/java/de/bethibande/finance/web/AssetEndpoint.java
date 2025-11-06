package de.bethibande.finance.web;

import de.bethibande.finance.model.jpa.Asset;
import de.bethibande.finance.security.Roles;
import jakarta.annotation.security.RolesAllowed;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.ws.rs.*;

import java.util.List;

@Path("/api/v1/asset")
public class AssetEndpoint {

    @POST
    @Transactional
    @RolesAllowed(Roles.USER)
    public Asset create(final Asset asset) {
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
    public void delete(final @PathParam("id") long id) {
        Asset.deleteById(id);
    }
}
