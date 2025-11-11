package de.bethibande.finance.model.web;

import de.bethibande.finance.model.jpa.User;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record UserWithPassword(
        Long id,
        @Min(3) @Max(255) String name,
        @Size(min = 1) Set<String> roles,
        String password
) {

    public User toUser() {
        final User user = new User();
        user.id = id();
        user.name = name();
        user.roles = roles();
        user.password = password();
        return user;
    }

}
