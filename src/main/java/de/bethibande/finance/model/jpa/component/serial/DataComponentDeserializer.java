package de.bethibande.finance.model.jpa.component.serial;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import de.bethibande.finance.model.jpa.component.DataComponent;
import de.bethibande.finance.model.jpa.component.DataComponentMap;

import java.io.IOException;
import java.util.Map;

public class DataComponentDeserializer extends JsonDeserializer<DataComponentMap> {

    @Override
    public DataComponentMap deserialize(final JsonParser p, final DeserializationContext ctxt) throws IOException, JacksonException {
        final DataComponentMap map = new DataComponentMap();

        final ObjectNode tree = p.readValueAsTree();

        for (final Map.Entry<String, JsonNode> entry : tree.properties()) {
            final String key = entry.getKey();
            final JsonNode node = entry.getValue();

            final DataComponent<?> comp = DataComponent.get(key);
            if (comp == null) throw new IllegalStateException("Unknown component: " + key);

            final Object value = p.getCodec().readValue(node.traverse(p.getCodec()), ctxt.constructType(comp.getType()));
            map.put(key, value);
        }

        return map;
    }
}
