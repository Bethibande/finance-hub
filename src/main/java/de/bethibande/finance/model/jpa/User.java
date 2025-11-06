package de.bethibande.finance.model.jpa;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import io.quarkus.security.jpa.Password;
import io.quarkus.security.jpa.Roles;
import io.quarkus.security.jpa.UserDefinition;
import io.quarkus.security.jpa.Username;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;

import java.util.Set;

@Entity
@Table(name = "Users")
@UserDefinition
public class User extends PanacheEntity {

    @Username
    @Size(min = 3, max = 255)
    @Column(nullable = false)
    public String name;

    @Password
    @Column(nullable = false)
    public String password;

    @Roles
    @ElementCollection
    public Set<String> roles;

    public record UserDto(String name, Set<String> roles) {

    }

    @Transient
    public UserDto toDto() {
        return new UserDto(name, roles);
    }

}
