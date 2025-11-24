package de.bethibande.finance.web.api.v1;

import de.bethibande.finance.model.jpa.Wallet;
import de.bethibande.finance.model.jpa.transaction.BookedAmount;
import de.bethibande.finance.model.jpa.transaction.Transaction;
import de.bethibande.finance.web.api.v1.crud.AbstractWorkspaceCRUDEndpoint;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.panache.common.Sort;
import jakarta.ws.rs.Path;

@Path("/api/v1/wallet")
public class WalletEndpoint extends AbstractWorkspaceCRUDEndpoint<Wallet> {

    @Override
    protected PanacheQuery<Wallet> find(final String query, final Sort sort, final Object... params) {
        return Wallet.find(query, sort, params);
    }

    @Override
    protected void deleteById(final long id) {
        Wallet.deleteById(id);
    }

    @Override
    protected boolean hasDependents(final long id) {
        if (Transaction.count("wallet.id = ?1", id) > 0) return true;
        if (BookedAmount.count("wallet.id = ?1", id) > 0) return true;
        return false;
    }
}
