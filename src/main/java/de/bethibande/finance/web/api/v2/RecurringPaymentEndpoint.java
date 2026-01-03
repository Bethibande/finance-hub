package de.bethibande.finance.web.api.v2;

import de.bethibande.finance.model.jpa.Asset;
import de.bethibande.finance.model.jpa.Wallet;
import de.bethibande.finance.model.jpa.Workspace;
import de.bethibande.finance.model.jpa.partner.Partner;
import de.bethibande.finance.model.jpa.recurring.RecurringPayment;
import de.bethibande.finance.model.jpa.recurring.RecurringPaymentDTO;
import de.bethibande.finance.model.jpa.recurring.RecurringPaymentDTOWithoutId;
import de.bethibande.finance.model.jpa.recurring.RecurringPaymentDTOWithoutWorkspace;
import de.bethibande.finance.model.jpa.transaction.Transaction;
import de.bethibande.finance.model.jpa.transaction.TransactionComponents;
import de.bethibande.finance.model.web.PagedResponse;
import de.bethibande.finance.web.api.v2.crud.AbstractCRUDEndpoint;
import de.bethibande.finance.web.api.v2.crud.WorkspacedParams;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.function.Predicate;

@Path("/api/v2/recurring")
public class RecurringPaymentEndpoint extends AbstractCRUDEndpoint {

    @POST
    @Transactional
    public RecurringPaymentDTO create(final RecurringPaymentDTOWithoutId dto) {
        final RecurringPayment payment = new RecurringPayment();
        payment.amount = dto.amount();
        payment.asset = Asset.findById(dto.assetId());
        payment.partner = dto.partnerId() != null ? Partner.findById(dto.partnerId()) : null;
        payment.type = dto.type();
        payment.wallet = Wallet.findById(dto.walletId());

        payment.name = dto.name();
        payment.cronSchedule = dto.cronSchedule();
        payment.notBefore = dto.notBefore();
        payment.notAfter = dto.notAfter();
        payment.status = dto.status();
        payment.workspace = Workspace.findById(dto.workspaceId());

        if (payment.asset == null
                || payment.wallet == null
                || payment.workspace == null
                || (dto.partnerId() != null && payment.partner == null)) {
            throw new NotFoundException();
        }

        payment.persist();

        final List<Transaction> transactions = payment.generatePayments(Instant.now(), true);
        Transaction.persist(transactions);

        return RecurringPaymentDTO.from(payment);
    }

    @PUT
    @Transactional
    public RecurringPaymentDTO patch(final RecurringPaymentDTOWithoutWorkspace dto) {
        final RecurringPayment payment = RecurringPayment.findById(dto.id());
        if (payment == null) throw new NotFoundException();

        payment.amount = dto.amount();
        payment.asset = Asset.findById(dto.assetId());
        payment.partner = dto.partnerId() != null ? Partner.findById(dto.partnerId()) : null;
        payment.type = dto.type();
        payment.wallet = Wallet.findById(dto.walletId());

        payment.name = dto.name();
        payment.cronSchedule = dto.cronSchedule();
        payment.notBefore = dto.notBefore();
        payment.notAfter = dto.notAfter();
        payment.status = dto.status();

        if (payment.asset == null
                || payment.wallet == null
                || payment.workspace == null
                || (dto.partnerId() != null && payment.partner == null)) {
            throw new NotFoundException();
        }

        payment.persist();

        return RecurringPaymentDTO.from(payment);
    }

    @POST
    @Transactional
    @Path("/{id}/updatePayments")
    public void updatePayments(final @PathParam("id") long id,
                               final @QueryParam("overwriteModified") @DefaultValue("false") boolean overwriteModified) {
        final RecurringPayment payment = RecurringPayment.findById(id);
        if (payment == null) throw new NotFoundException();

        final Instant now = Instant.now();
        final RecurringPayment.PaymentUpdateResult result = payment.updatePayments(now, overwriteModified);

        Transaction.delete("id IN ?1", result.delete().stream().map(tx -> tx.id).toList());
        Transaction.persist(result.create());
    }

    @GET
    @Transactional
    @Path("/{workspace_id}")
    public PagedResponse<RecurringPaymentDTO> list(final @BeanParam WorkspacedParams params) {
        final PanacheQuery<RecurringPayment> query = RecurringPayment.find("workspace.id = ?1", params.getSort(), params.workspaceId)
                .page(params.getPage());

        return PagedResponse.of(
                params.page,
                params.size,
                query.count(),
                query.stream().map(RecurringPaymentDTO::from).toList()
        );
    }

    @Override
    protected boolean hasDependents(final long id) {
        return false;
    }

    @Override
    @Transactional
    protected void deleteById(final long id) {
        RecurringPayment.deleteAllOpenScheduledPayments(id);
        RecurringPayment.deleteById(id);
    }
}
