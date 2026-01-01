package de.bethibande.finance.model.jpa.transaction;

import com.bethibande.process.annotation.EntityDTO;
import com.fasterxml.jackson.annotation.JsonIncludeProperties;
import de.bethibande.finance.model.jpa.component.ComponentUtils;
import de.bethibande.finance.model.jpa.component.DataComponentMap;
import de.bethibande.finance.model.jpa.component.JPAComponentBearer;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.List;

@Entity
@EntityDTO(excludeProperties = "bookedAmounts")
@EntityDTO(excludeProperties = {"id", "bookedAmounts"})
@EntityDTO(excludeProperties = {"workspace", "bookedAmounts"})
@EntityDTO(excludeProperties = {"bookedAmounts"}, expandProperties = {"asset", "partner", "wallet"}, name = "TransactionDTOExpanded")
public class Transaction extends AbstractPayment implements ComponentUtils {

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

    @Embedded
    public JPAComponentBearer components = new JPAComponentBearer();

    @Override
    public DataComponentMap getDataComponents() {
        if (components == null) {
            components = new JPAComponentBearer();
        }

        return components.getDataComponents();
    }
}
