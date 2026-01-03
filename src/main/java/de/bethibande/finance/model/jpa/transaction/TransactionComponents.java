package de.bethibande.finance.model.jpa.transaction;

import de.bethibande.finance.model.jpa.component.DataComponent;

public class TransactionComponents {

    /**
     * Denotes a generated entity that was modified by the user and thus might diverge from the generated data
     */
    public static final DataComponent<Boolean> USER_MODIFIED = DataComponent.of("user_modified", Boolean.class);

}
