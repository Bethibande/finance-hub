package de.bethibande.finance.model.jpa;

import com.bethibande.process.annotation.EntityDTO;
import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;

@Entity
@EntityDTO
@EntityDTO(excludeProperties = "id")
public class Workspace extends PanacheEntity {

    @Column(nullable = false)
    public String name;

}
