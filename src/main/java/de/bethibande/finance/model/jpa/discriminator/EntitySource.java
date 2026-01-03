package de.bethibande.finance.model.jpa.discriminator;

public interface EntitySource {

    Long getId();

    int getDiscriminator();

}
