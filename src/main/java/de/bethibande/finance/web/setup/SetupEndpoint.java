package de.bethibande.finance.web.setup;

import de.bethibande.finance.model.jpa.User;
import de.bethibande.finance.model.jpa.Workspace;
import de.bethibande.finance.security.AuthEndpoint;
import de.bethibande.finance.security.Roles;
import io.quarkus.elytron.security.common.BcryptUtil;
import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.annotation.security.PermitAll;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Response;

import java.util.Set;

@RunOnVirtualThread
@Path("/api/v1/setup")
public class SetupEndpoint {

    @GET
    @Path("/stage")
    public SetupStage detectStage() {
        if (User.count() <= 0) return SetupStage.CREATE_USER;
        if (Workspace.count() <= 0) return SetupStage.CREATE_WORKSPACE;
        return SetupStage.COMPLETE;
    }

    public record UserInfo(String username, String password) {}

    @POST
    @PermitAll
    @Transactional
    @Path("/user")
    public Response createDefaultUser(final UserInfo credentials) {
        if (detectStage() != SetupStage.CREATE_USER) return Response.status(Response.Status.FORBIDDEN).build();

        final User user = new User();
        user.name = credentials.username;
        user.password = BcryptUtil.bcryptHash(credentials.password);
        user.roles = Set.of(Roles.USER, Roles.ADMIN);
        user.persist();

        return Response.ok().build();
    }

}
