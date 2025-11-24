package de.bethibande.finance.web.api.v2.crud;

import de.bethibande.finance.model.web.ErrorResponse;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;

public abstract class AbstractCRUDEndpoint {

    protected abstract boolean hasDependents(final long id);

    protected abstract void deleteById(final long id);

    @DELETE
    @Path("/{id}")
    @Transactional
    @APIResponse(
            responseCode = "200",
            content = @Content()
    )
    @APIResponse(
            responseCode = "409",
            description = "If the resource cannot be deleted due to dependent resources",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class)
            )
    )
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
