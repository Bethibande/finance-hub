package de.bethibande.finance.model.jpa.component;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import org.hibernate.annotations.Type;

@Embeddable
public class JPAComponentBearer {

    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb")
    public DataComponentMap dataComponents = new DataComponentMap();

    public DataComponentMap getDataComponents() {
        if (dataComponents != null) {
            return dataComponents;
        }

        dataComponents = new DataComponentMap();
        return dataComponents;
    }

}
