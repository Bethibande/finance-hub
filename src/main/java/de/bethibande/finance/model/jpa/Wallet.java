package de.bethibande.finance.model.jpa;

import com.bethibande.process.annotation.EntityDTO;
import de.bethibande.finance.model.jpa.partner.Partner;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;

@Entity
@EntityDTO
@EntityDTO(excludeProperties = "id")
@EntityDTO(excludeProperties = "workspace")
@EntityDTO(expandProperties = {"provider", "asset"}, name = "WalletDTOExpanded")
public class Wallet extends WorkspaceEntity {

    @Column(nullable = false)
    public String name;

    @Column
    public String notes;

    @ManyToOne
    public Partner provider;

    @ManyToOne
    public Asset asset;

}
