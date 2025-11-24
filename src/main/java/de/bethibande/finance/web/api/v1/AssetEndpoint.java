package de.bethibande.finance.web.api.v1;

import de.bethibande.finance.model.jpa.Asset;
import de.bethibande.finance.model.jpa.ExchangeRate;
import de.bethibande.finance.model.jpa.Wallet;
import de.bethibande.finance.model.jpa.transaction.BookedAmount;
import de.bethibande.finance.model.jpa.transaction.Transaction;
import de.bethibande.finance.web.api.v1.crud.AbstractWorkspaceCRUDEndpoint;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.panache.common.Sort;
import jakarta.ws.rs.Path;

@Path("/api/v1/asset")
public class AssetEndpoint extends AbstractWorkspaceCRUDEndpoint<Asset> {

    @Override
    protected PanacheQuery<Asset> find(final String query, final Sort sort, final Object... params) {
        return Asset.find(query, sort, params);
    }

    @Override
    protected void deleteById(final long id) {
        Asset.deleteById(id);
    }

    @Override
    protected boolean hasDependents(final long id) {
        if (Wallet.count("asset.id = ?1", id) > 0) return true;
        if (Transaction.count("asset.id = ?1", id) > 0) return true;
        if (BookedAmount.count("asset.id = ?1", id) > 0) return true;
        if (ExchangeRate.count("base.id = ?1 OR quote.id = ?1", id) > 0) return true;
        return false;
    }
}
