package de.bethibande.finance.web;

import de.bethibande.finance.model.jpa.Asset;
import de.bethibande.finance.model.jpa.Wallet;
import de.bethibande.finance.model.jpa.partner.Partner;
import de.bethibande.finance.model.jpa.transaction.Transaction;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import jakarta.ws.rs.Path;

@Path("/api/v1/partner")
public class PartnerEndpoint extends AbstractWorkspaceCRUDEndpoint<Partner> {

    @Override
    protected PanacheQuery<Partner> find(final String query, final Object... params) {
        return Partner.find(query, params);
    }

    @Override
    protected void deleteById(final long id) {
        Partner.deleteById(id);
    }

    @Override
    protected boolean hasDependents(final long id) {
        if (Asset.count("provider.id = ?1", id) > 0) return true;
        if (Transaction.count("partner.id = ?1", id) > 0) return true;
        if (Wallet.count("provider.id = ?1", id) > 0) return true;
        return false;
    }
}
