package de.bethibande.finance.model.jpa.discriminator;

import de.bethibande.finance.model.jpa.recurring.RecurringPayment;

public interface GeneratedEntity {

    void setSourceId(final long id);

    void setSourceDiscriminator(final int discriminator);

    Long getSourceId();

    Integer getSourceDiscriminator();

    default void setSource(final EntitySource source) {
        if (source.getId() == null) throw new IllegalArgumentException("Entity must be persistent");

        setSourceId(source.getId());
        setSourceDiscriminator(source.getDiscriminator());
    }

    default EntitySource fetchSource() {
        if (getSourceDiscriminator() == null) return null;

        return switch (getSourceDiscriminator()) {
            case SourceDiscriminators.RECURRING_PAYMENTS -> RecurringPayment.findById(getSourceId());
            default -> throw new IllegalArgumentException("Unknown source discriminator: " + getSourceDiscriminator());
        };
    }

    default boolean isGenerated() {
        return getSourceId() != null;
    }

}
