package de.bethibande.finance.security;

import de.bethibande.finance.model.jpa.User;
import io.quarkus.elytron.security.common.BcryptUtil;
import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.jwt.build.Jwt;
import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.NewCookie;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.time.Duration;
import java.util.HashSet;
import java.util.Objects;

@Path("/auth")
public class AuthEndpoint {

    public static class Credentials {
        public String username;
        public String password;
    }

    @Inject
    protected SecurityIdentity identity;

    @ConfigProperty(name = "quarkus.profile")
    protected String profile;

    @ConfigProperty(name = "mp.jwt.verify.issuer")
    protected String issuer;

    @ConfigProperty(name = "mp.jwt.token.cookie")
    protected String cookieName;

    protected boolean isDevMode() {
        return Objects.equals(profile, "dev");
    }

    @POST
    @PermitAll
    @Path("/login")
    public Response login(final Credentials credentials) {
        final User user = User.find("name", credentials.username).firstResult();
        if (user == null || !BcryptUtil.matches(credentials.password, user.password)) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }

        final Duration duration = Duration.ofHours(24);
        final String token = Jwt.issuer(issuer)
                .upn(credentials.username)
                .groups(new HashSet<>(user.roles))
                .expiresIn(duration)
                .sign();

        return Response.ok(user.toDto())
                .cookie(new NewCookie.Builder(cookieName)
                        .value(token)
                        .httpOnly(true)
                        .secure(!isDevMode())
                        .sameSite(NewCookie.SameSite.STRICT)
                        .path("/")
                        .maxAge((int) duration.toSeconds())
                        .build())
                .build();
    }

    @POST
    @PermitAll
    @Path("/logout")
    public Response logout() {
        return Response.ok()
                .cookie(new NewCookie.Builder(cookieName)
                        .httpOnly(true)
                        .secure(!isDevMode())
                        .path("/")
                        .maxAge(0)
                        .value("")
                        .build())
                .build();
    }

    @GET
    @PermitAll
    @Path("/me")
    public Response me() {
        if (identity.isAnonymous()) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(new User.UserDto(identity.getPrincipal().getName(), identity.getRoles())).build();
    }

}
