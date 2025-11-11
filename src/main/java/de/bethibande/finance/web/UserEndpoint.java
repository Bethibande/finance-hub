package de.bethibande.finance.web;

import de.bethibande.finance.model.jpa.User;
import de.bethibande.finance.model.web.PagedResponse;
import de.bethibande.finance.model.web.UserWithPassword;
import de.bethibande.finance.security.Roles;
import io.quarkus.elytron.security.common.BcryptUtil;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import jakarta.annotation.security.RolesAllowed;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;

@Path("/api/v1/user")
@RolesAllowed(Roles.ADMIN)
public class UserEndpoint {

    @POST
    @Transactional
    public User create(final UserWithPassword dto) {
        final User user = dto.toUser();
        user.password = BcryptUtil.bcryptHash(dto.password());
        user.persist();

        return user;
    }

    @PATCH
    @Transactional
    public void update(final UserWithPassword user) {
        final User source = User.findById(user.id());
        if (source == null) {
            throw new NotFoundException();
        }

        source.name = user.name();
        source.roles = user.roles();
        if (user.password() != null) source.password = BcryptUtil.bcryptHash(user.password());
    }

    @GET
    public PagedResponse<User> find(final @QueryParam("page") @DefaultValue("0") int page,
                                    final @QueryParam("size") @DefaultValue("50") int size) {
        final PanacheQuery<User> query = User.findAll().page(page, size);
        return PagedResponse.of(page, size, query);
    }

    @DELETE
    @Path("/{id}")
    public void deleteById(@PathParam("id") final long id) {
        User.deleteById(id);
    }
}
