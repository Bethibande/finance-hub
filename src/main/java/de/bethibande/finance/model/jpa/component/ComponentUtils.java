package de.bethibande.finance.model.jpa.component;

import jakarta.persistence.Transient;

public interface ComponentUtils {

    DataComponentMap getDataComponents();

    default <T> void set(final DataComponent<T> component, final T value) {
        if (value == null) {
            getDataComponents().remove(component.getKey());
        }

        getDataComponents().put(component.getKey(), value);
    }

    @Transient
    default boolean has(final DataComponent<?> component) {
        return getDataComponents().containsKey(component.getKey());
    }

    @Transient
    @SuppressWarnings("unchecked")
    default <T> T get(final DataComponent<T> component) {
        return (T) getDataComponents().get(component.getKey());
    }

    @Transient
    default <T> T get(final DataComponent<T> component, final T def) {
        final T val = get(component);
        return val != null ? val : def;
    }

}
