package de.bethibande.finance.model.jpa.recurring;

public enum RecurringPaymentStatus {

    /**
     * The payment is active and new transactions will be generated until the expiry date
     */
    ACTIVE,

    /**
     * The expiry date has passed and the payment is no longer creating new transactions
     */
    EXPIRED,

    /**
     * The payments are suspended, and no new transactions will be generated until this status is changed or the expiry date passes.
     */
    SUSPENDED,

    /**
     * The payment is canceled and no new transactions will be generated
     */
    CANCELLED

}
