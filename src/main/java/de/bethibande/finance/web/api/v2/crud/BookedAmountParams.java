package de.bethibande.finance.web.api.v2.crud;

import jakarta.ws.rs.PathParam;

public class BookedAmountParams extends PaginationParams {

    @PathParam("transaction_id")
    public long transactionId;

}
