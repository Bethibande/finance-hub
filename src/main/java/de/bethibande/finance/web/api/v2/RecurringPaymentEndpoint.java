package de.bethibande.finance.web.api.v2;

import de.bethibande.finance.model.jpa.Asset;
import de.bethibande.finance.model.jpa.Wallet;
import de.bethibande.finance.model.jpa.Workspace;
import de.bethibande.finance.model.jpa.partner.Partner;
import de.bethibande.finance.model.jpa.recurring.RecurringPayment;
import de.bethibande.finance.model.jpa.recurring.RecurringPaymentDTO;
import de.bethibande.finance.model.jpa.recurring.RecurringPaymentDTOWithoutId;
import de.bethibande.finance.model.jpa.recurring.RecurringPaymentDTOWithoutWorkspace;
import de.bethibande.finance.model.web.PagedResponse;
import de.bethibande.finance.web.api.v2.crud.AbstractCRUDEndpoint;
import de.bethibande.finance.web.api.v2.crud.WorkspacedParams;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;

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

        return RecurringPaymentDTO.from(payment);
    }

    @PATCH
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

    @GET
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
    protected void deleteById(final long id) {
        RecurringPayment.deleteById(id);
    }
}
