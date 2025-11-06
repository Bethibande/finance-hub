package de.bethibande.finance.web;

import de.bethibande.finance.model.jpa.Workspace;
import de.bethibande.finance.security.Roles;
import jakarta.annotation.security.RolesAllowed;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;

import java.util.List;

@Path("/api/v1/workspace")
public class WorkspaceEndpoint {

    @POST
    @Transactional
    @RolesAllowed(Roles.USER)
    public Workspace create(final Workspace workspace) {
        workspace.persist();
        return workspace;
    }

    @GET
    @Transactional
    @RolesAllowed(Roles.USER)
    public List<Workspace> list() {
        return Workspace.listAll();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    @RolesAllowed(Roles.USER)
    public void delete(final @PathParam("id") long id) {
        Workspace.deleteById(id);
    }

}
