package de.bethibande.finance.web.api.v2;

import de.bethibande.finance.model.jpa.User;
import de.bethibande.finance.model.jpa.UserDTOWithoutId;
import de.bethibande.finance.model.jpa.UserDTOWithoutNameAndRoles;
import de.bethibande.finance.model.jpa.UserDTOWithoutPassword;
import de.bethibande.finance.model.web.PagedResponse;
import de.bethibande.finance.security.Roles;
import de.bethibande.finance.web.api.v2.crud.PaginationParams;
import io.quarkus.elytron.security.common.BcryptUtil;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import jakarta.annotation.security.RolesAllowed;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;

@Path("/api/v2/user")
@RolesAllowed(Roles.ADMIN)
public class UserEndpoint {

    @POST
    @Transactional
    public UserDTOWithoutPassword createUser(final UserDTOWithoutId userDTO) {
        final User user = new User();
        user.name = userDTO.name();
        user.password = BcryptUtil.bcryptHash(userDTO.password());
        user.roles = userDTO.roles();

        user.persist();

        return UserDTOWithoutPassword.from(user);
    }

    @PUT
    @Transactional
    public UserDTOWithoutPassword updateUser(final UserDTOWithoutPassword userDTO) {
        final User user = User.findById(userDTO.id());
        if (user == null) throw new NotFoundException();

        user.name = userDTO.name();
        user.roles = userDTO.roles();

        return UserDTOWithoutPassword.from(user);
    }

    @PATCH
    @Path("/password")
    @Transactional
    public UserDTOWithoutPassword updateUserPassword(final UserDTOWithoutNameAndRoles userDTO) {
        final User user = User.findById(userDTO.id());
        if (user == null) throw new NotFoundException();

        user.password = BcryptUtil.bcryptHash(userDTO.password());

        return UserDTOWithoutPassword.from(user);
    }

    @DELETE
    @Transactional
    @Path("/{id}")
    public void deleteUser(@PathParam("id") final long id) {
        User.deleteById(id);
    }

    @GET
    @Transactional
    public PagedResponse<UserDTOWithoutPassword> listUsers(final @BeanParam PaginationParams params) {
        final PanacheQuery<User> query = User.findAll(params.getSort())
                .page(params.getPage());

        return PagedResponse.of(
                params.page,
                params.size,
                query.count(),
                query.stream().map(UserDTOWithoutPassword::from).toList()
        );
    }

}
