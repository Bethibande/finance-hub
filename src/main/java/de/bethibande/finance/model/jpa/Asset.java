package de.bethibande.finance.model.jpa;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.Length;

@Entity
public class Asset extends WorkspaceEntity {

    @NotBlank
    @Size(min = 1, max = 255)
    @Column(nullable = false)
    public String name;

    @NotBlank
    @Size(min = 3, max = 8)
    @Column(nullable = false)
    public String code;

    @Column
    @Length(max = 10)
    public String symbol;

    @Column
    @Length(max = 1024)
    public String notes;

}
