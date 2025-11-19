package de.bethibande.finance.web;

import de.bethibande.finance.model.jpa.transaction.BookedAmount;
import de.bethibande.finance.model.jpa.transaction.Transaction;
import de.bethibande.finance.model.web.ErrorResponse;
import de.bethibande.finance.model.web.PagedResponse;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Response;
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
        if (BookedAmount.count("transaction.id = ?1", id) > 0) return true;
        if (Transaction.count("internalRef.id = ?1", id) > 0) return true;
        return false;
    }

    public record TransactionLinkRequest(
            long firstId,
            long secondId
    ) {
    }

    @PATCH
    @Transactional
    @Path("/link")
    public Response link(final TransactionLinkRequest body) {
        final Transaction a = Transaction.findById(body.firstId);
        final Transaction b = Transaction.findById(body.secondId);

        if (a == null || b == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        if (a.internalRef != null || b.internalRef != null) {
            return Response.status(Response.Status.CONFLICT)
                    .entity(new ErrorResponse(409, "already linked", "error.transaction.linked"))
                    .build();
        }

        a.internalRef = b;
        b.internalRef = a;

        return Response.ok().build();
    }

    public record TransactionUnlinkRequest(
            long id
    ) {
    }

    @PATCH
    @Transactional
    @Path("/unlink")
    public Response unlink(final TransactionUnlinkRequest body) {
        final Transaction a = Transaction.findById(body.id);
        if (a == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        final Transaction b = a.internalRef;
        b.internalRef = null;
        a.internalRef = null;

        return Response.ok().build();
    }

}
