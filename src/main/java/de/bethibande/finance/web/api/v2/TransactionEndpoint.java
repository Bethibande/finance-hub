package de.bethibande.finance.web.api.v2;

import de.bethibande.finance.model.jpa.Asset;
import de.bethibande.finance.model.jpa.Wallet;
import de.bethibande.finance.model.jpa.Workspace;
import de.bethibande.finance.model.jpa.partner.Partner;
import de.bethibande.finance.model.jpa.transaction.*;
import de.bethibande.finance.model.web.PagedResponse;
import de.bethibande.finance.security.Roles;
import de.bethibande.finance.web.api.v2.crud.AbstractCRUDEndpoint;
import de.bethibande.finance.web.api.v2.crud.WorkspacedParams;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import jakarta.annotation.security.RolesAllowed;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;

@Path("/api/v2/transaction")
@RolesAllowed({Roles.ADMIN, Roles.USER})
public class TransactionEndpoint extends AbstractCRUDEndpoint {

    @POST
    @Transactional
    public TransactionDTOWithoutBookedAmounts createTransaction(final TransactionDTOWithoutIdAndBookedAmounts dto) {
        final Transaction transaction = new Transaction();
        transaction.name = dto.name();
        transaction.amount = dto.amount();
        transaction.date = dto.date();
        transaction.asset = dto.assetId() != null ? Asset.findById(dto.assetId()) : null;
        transaction.wallet = dto.walletId() != null ? Wallet.findById(dto.walletId()) : null;
        transaction.partner = dto.partnerId() != null ? Partner.findById(dto.partnerId()) : null;
        transaction.status = dto.status();
        transaction.type = dto.type();
        transaction.internalRef = dto.internalRefId() != null ? Transaction.findById(dto.internalRefId()) : null;
        transaction.workspace = Workspace.findById(dto.workspaceId());
        transaction.notes = dto.notes();

        if (transaction.asset == null
                || transaction.wallet == null
                || transaction.partner == null
                || transaction.workspace == null
                || (transaction.internalRef == null && dto.internalRefId() != null)) {
            throw new NotFoundException();
        }

        transaction.persist();

        return TransactionDTOWithoutBookedAmounts.from(transaction);
    }

    @PATCH
    @Transactional
    public TransactionDTOWithoutBookedAmounts updateTransaction(final TransactionDTOWithoutWorkspaceAndBookedAmounts dto) {
        final Transaction transaction = Transaction.findById(dto.id());
        if (transaction == null) throw new NotFoundException();

        transaction.name = dto.name();
        transaction.amount = dto.amount();
        transaction.date = dto.date();
        transaction.asset = dto.assetId() != null ? Asset.findById(dto.assetId()) : null;
        transaction.wallet = dto.walletId() != null ? Wallet.findById(dto.walletId()) : null;
        transaction.partner = dto.partnerId() != null ? Partner.findById(dto.partnerId()) : null;
        transaction.status = dto.status();
        transaction.type = dto.type();
        transaction.internalRef = dto.internalRefId() != null ? Transaction.findById(dto.internalRefId()) : null;
        transaction.notes = dto.notes();

        if (transaction.asset == null
                || transaction.wallet == null
                || transaction.partner == null
                || (transaction.internalRef == null && dto.internalRefId() != null)) {
            throw new NotFoundException();
        }

        return TransactionDTOWithoutBookedAmounts.from(transaction);
    }

    @GET
    @Transactional
    @Path("/{workspace_id}")
    public PagedResponse<TransactionDTOExpanded> listTransactions(final @BeanParam WorkspacedParams params) {
        final PanacheQuery<Transaction> query = Transaction.find("workspace.id = ?1", params.getSort(), params.workspaceId)
                .page(params.getPage());

        return PagedResponse.of(
                params.page,
                params.size,
                query.count(),
                query.stream().map(TransactionDTOExpanded::from).toList()
        );
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

}
