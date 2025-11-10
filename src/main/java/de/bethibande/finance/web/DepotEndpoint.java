package de.bethibande.finance.web;

import de.bethibande.finance.model.jpa.Depot;
import de.bethibande.finance.model.jpa.transaction.BookedAmount;
import de.bethibande.finance.model.jpa.transaction.Transaction;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import jakarta.ws.rs.Path;

@Path("/api/v1/depot")
public class DepotEndpoint extends AbstractWorkspaceCRUDEndpoint<Depot> {

    @Override
    protected PanacheQuery<Depot> find(final String query, final Object... params) {
        return Depot.find(query, params);
    }

    @Override
    protected void deleteById(final long id) {
        Depot.deleteById(id);
    }

    @Override
    protected boolean hasDependents(final long id) {
        if (Transaction.count("depot.id = ?1", id) > 0) return true;
        if (BookedAmount.count("depot.id = ?1", id) > 0) return true;
        return false;
    }
}
