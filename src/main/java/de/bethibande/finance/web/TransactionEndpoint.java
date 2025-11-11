package de.bethibande.finance.web;

import de.bethibande.finance.model.jpa.transaction.BookedAmount;
import de.bethibande.finance.model.jpa.transaction.Transaction;
import de.bethibande.finance.model.web.PagedResponse;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Path;
import org.hibernate.Hibernate;

@Path("/api/v1/transaction")
public class TransactionEndpoint extends AbstractWorkspaceCRUDEndpoint<Transaction> {

    protected void initialize(final Transaction transaction) {
        Hibernate.initialize(transaction.bookedAmounts);
    }

    @Override
    @Transactional
    public Transaction persist(final Transaction asset) {
        final Transaction transaction = super.persist(asset);
        initialize(transaction);
        return transaction;
    }

    @Override
    @Transactional
    public PagedResponse<Transaction> listByWorkspace(final long workspace, final int page, final int size) {
        final PagedResponse<Transaction> response = super.listByWorkspace(workspace, page, size);
        response.data().forEach(this::initialize);

        return response;
    }

    @Override
    protected PanacheQuery<Transaction> find(final String query, final Object... params) {
        return Transaction.find(query, params);
    }

    @Override
    protected void deleteById(final long id) {
        Transaction.deleteById(id);
    }

    @Override
    protected boolean hasDependents(final long id) {
        return BookedAmount.count("transaction.id = ?1", id) > 0;
    }
}
