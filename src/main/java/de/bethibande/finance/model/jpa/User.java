package de.bethibande.finance.model.jpa;

import com.bethibande.process.annotation.EntityDTO;
import com.fasterxml.jackson.annotation.JsonIgnore;
import io.quarkus.hibernate.orm.panache.PanacheEntity;
import io.quarkus.security.jpa.Password;
import io.quarkus.security.jpa.Roles;
import io.quarkus.security.jpa.UserDefinition;
import io.quarkus.security.jpa.Username;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;

import java.util.Set;

@Entity
@UserDefinition
@Table(name = "Users")
@EntityDTO
@EntityDTO(excludeProperties = {"password"})
@EntityDTO(excludeProperties = {"id"})
public class User extends PanacheEntity {

    @Username
    @Size(min = 3, max = 255)
    @Column(nullable = false)
    public String name;

    @Password
    @JsonIgnore
    @Column(nullable = false)
    public String password;

    @Roles
    @ElementCollection(fetch = FetchType.EAGER)
    public Set<String> roles;

    public record UserDto(String name, Set<String> roles) {

    }

    @Transient
    public UserDto toDto() {
        return new UserDto(name, roles);
    }

}
