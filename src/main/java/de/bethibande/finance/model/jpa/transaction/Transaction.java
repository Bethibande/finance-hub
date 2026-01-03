package de.bethibande.finance.model.jpa.transaction;

import com.bethibande.process.annotation.EntityDTO;
import com.bethibande.process.annotation.VirtualDTOField;
import com.fasterxml.jackson.annotation.JsonIncludeProperties;
import de.bethibande.finance.model.jpa.component.ComponentUtils;
import de.bethibande.finance.model.jpa.component.DataComponentMap;
import de.bethibande.finance.model.jpa.component.JPAComponentBearer;
import de.bethibande.finance.model.jpa.discriminator.EntitySource;
import de.bethibande.finance.model.jpa.discriminator.GeneratedEntity;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.List;

@Entity
@EntityDTO(excludeProperties = {"bookedAmounts", "components.dataComponents", "source"}, name = "TransactionDTOWithoutBookedAmounts")
@EntityDTO(excludeProperties = {"id", "bookedAmounts", "components.dataComponents", "source"}, name = "TransactionDTOWithoutIdAndBookedAmounts")
@EntityDTO(excludeProperties = {"workspace", "bookedAmounts", "components.dataComponents", "source"}, name = "TransactionDTOWithoutWorkspaceAndBookedAmounts")
@EntityDTO(excludeProperties = {"bookedAmounts", "components.dataComponents"}, expandProperties = {"asset", "partner", "wallet"}, name = "TransactionDTOExpanded")
public class Transaction extends AbstractPayment implements ComponentUtils, GeneratedEntity {

    @Column(nullable = false)
    public Instant date;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    public TransactionStatus status;

    @OneToMany(mappedBy = "transaction")
    public List<BookedAmount> bookedAmounts;

    @ManyToOne
    @JsonIncludeProperties("id")
    public Transaction internalRef;

    public Long sourceId;

    public Integer sourceDiscriminator;

    @Embedded
    public JPAComponentBearer components = new JPAComponentBearer();

    @Override
    public DataComponentMap getDataComponents() {
        if (components == null) {
            components = new JPAComponentBearer();
        }

        return components.getDataComponents();
    }

    @Override
    public void setSourceId(final long id) {
        this.sourceId = id;
    }

    @Override
    public void setSourceDiscriminator(final int discriminator) {
        this.sourceDiscriminator = discriminator;
    }

    @Override
    public Long getSourceId() {
        return this.sourceId;
    }

    @Override
    public Integer getSourceDiscriminator() {
        return this.sourceDiscriminator;
    }

    @VirtualDTOField
    public EntitySource getSource() {
        return fetchSource();
    }

}
