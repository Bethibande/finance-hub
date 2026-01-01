package de.bethibande.finance.model.jpa.component.serial;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import de.bethibande.finance.model.jpa.component.DataComponentMap;
import jakarta.enterprise.event.Observes;

public class SerialConfig {

    public void configure(final @Observes ObjectMapper mapper) {
        final SimpleModule module = new SimpleModule();
        module.addDeserializer(DataComponentMap.class, new DataComponentDeserializer());
        module.addSerializer(DataComponentMap.class, new DataComponentSerializer());

        mapper.registerModule(module);
    }

}
