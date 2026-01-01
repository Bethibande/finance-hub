package de.bethibande.finance.model.jpa.component.serial;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import de.bethibande.finance.model.jpa.component.DataComponent;
import de.bethibande.finance.model.jpa.component.DataComponentMap;

import java.io.IOException;
import java.util.Map;

public class DataComponentSerializer extends JsonSerializer<DataComponentMap> {

    @Override
    public void serialize(final DataComponentMap map,
                          final JsonGenerator gen,
                          final SerializerProvider serializers) throws IOException {
        if (map == null || map.isEmpty()) {
            gen.writeNull();
            return;
        }

        gen.writeStartObject();

        for (final Map.Entry<String, Object> entry : map.entrySet()) {
            final String key = entry.getKey();
            final Object value = entry.getValue();

            final DataComponent<?> comp = DataComponent.get(key);
            if (comp == null) throw new IllegalStateException("Unknown component: " + key);

            gen.writeObjectField(key, value);
        }

        gen.writeEndObject();
    }
}
