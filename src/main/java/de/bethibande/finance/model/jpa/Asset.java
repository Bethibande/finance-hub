package de.bethibande.finance.model.jpa;

import com.bethibande.process.annotation.EntityDTO;
import de.bethibande.finance.model.jpa.partner.Partner;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.Length;

@Entity
@EntityDTO
@EntityDTO(excludeProperties = "id")
@EntityDTO(excludeProperties = "workspace")
@EntityDTO(expandProperties = {"provider"}, name = "AssetDTOExpanded")
public class Asset extends WorkspaceEntity {

    @NotBlank
    @Size(min = 1, max = 255)
    @Column(nullable = false)
    public String name;

    @NotBlank
    @Size(min = 3, max = 12)
    @Column(nullable = false)
    public String code;

    @Column
    @Length(max = 10)
    public String symbol;

    @Column
    @Length(max = 1024)
    public String notes;

    @ManyToOne
    public Partner provider;

}
