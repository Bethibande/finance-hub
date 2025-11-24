package de.bethibande.finance.model.jpa.partner;

import com.bethibande.process.annotation.EntityDTO;
import de.bethibande.finance.model.jpa.WorkspaceEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

@Entity
@EntityDTO
@EntityDTO(excludeProperties = "id")
@EntityDTO(excludeProperties = "workspace")
public class Partner extends WorkspaceEntity {

    @Column(nullable = false)
    public String name;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    public PartnerType type;

    @Column
    public String notes;

}
