package de.bethibande.finance.model.jpa.component;

import org.jspecify.annotations.Nullable;

import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Map;

/**
 * Allows dynamic data to be attached to some entities.
 * Basic usage is the following:
 * <pre>
 * {@code
 * public static final DataComponent<Boolean> MY_COMPONENT = DataComponent.of("myBoolean", Boolean.class);
 *
 * public void add(final Transaction tx) {
 *     tx.set(MY_COMPONENT, true);
 * }
 *
 * public boolean get(final Transaction tx) {
 *     return tx.get(MY_COMPONENT, false);
 * }
 * }
 * </pre>
 * @param <T>
 * @see JPAComponentBearer
 */
public final class DataComponent<T> {

    private static final Map<String, DataComponent<?>> COMPONENTS = new HashMap<>();

    public static @Nullable DataComponent<?> get(final String key) {
        return COMPONENTS.get(key);
    }

    public static synchronized <T> DataComponent<T> of(final String key, final Type type) {
        if (COMPONENTS.containsKey(key)) throw new IllegalArgumentException("Key already in use");

        final DataComponent<T> comp = new DataComponent<>(key, type);
        COMPONENTS.put(key, comp);

        return comp;
    }

    private final String key;
    private final Type type;

    private DataComponent(final String key, final Type type) {
        this.key = key;
        this.type = type;
    }

    public String getKey() {
        return key;
    }

    public Type getType() {
        return type;
    }
}
