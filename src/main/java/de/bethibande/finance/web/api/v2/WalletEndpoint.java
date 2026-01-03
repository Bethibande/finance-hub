package de.bethibande.finance.web.api.v2;

import de.bethibande.finance.model.jpa.*;
import de.bethibande.finance.model.jpa.partner.Partner;
import de.bethibande.finance.model.jpa.recurring.RecurringPayment;
import de.bethibande.finance.model.jpa.transaction.BookedAmount;
import de.bethibande.finance.model.jpa.transaction.Transaction;
import de.bethibande.finance.model.web.PagedResponse;
import de.bethibande.finance.security.Roles;
import de.bethibande.finance.web.api.v2.crud.AbstractCRUDEndpoint;
import de.bethibande.finance.web.api.v2.crud.WorkspacedParams;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import jakarta.annotation.security.RolesAllowed;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;

@Path("/api/v2/wallet")
@RolesAllowed({Roles.ADMIN, Roles.USER})
public class WalletEndpoint extends AbstractCRUDEndpoint {

    @POST
    @Transactional
    public WalletDTO createWallet(final WalletDTOWithoutId dto) {
        final Wallet wallet = new Wallet();
        wallet.name = dto.name();
        wallet.asset = dto.assetId() != null ? Asset.findById(dto.assetId()) : null;
        wallet.provider = dto.providerId() != null ? Partner.findById(dto.providerId()) : null;
        wallet.workspace = Workspace.findById(dto.workspaceId());
        wallet.notes = dto.notes();

        if (wallet.workspace == null) throw new NotFoundException();
        if (wallet.asset == null && dto.assetId() != null) throw new NotFoundException();
        if (wallet.provider == null && dto.providerId() != null) throw new NotFoundException();

        wallet.persist();

        return WalletDTO.from(wallet);
    }

    @PUT
    @Transactional
    public WalletDTO updateWallet(final WalletDTOWithoutWorkspace dto) {
        final Wallet wallet = Wallet.findById(dto.id());
        if (wallet == null) throw new NotFoundException();

        wallet.name = dto.name();
        wallet.asset = dto.assetId() != null ? Asset.findById(dto.assetId()) : null;
        wallet.provider = dto.providerId() != null ? Partner.findById(dto.providerId()) : null;
        wallet.notes = dto.notes();

        if (wallet.asset == null && dto.assetId() != null) throw new NotFoundException();
        if (wallet.provider == null && dto.providerId() != null) throw new NotFoundException();

        wallet.persist();

        return WalletDTO.from(wallet);
    }

    @GET
    @Transactional
    @Path("/{workspace_id}")
    public PagedResponse<WalletDTOExpanded> listWallets(final @BeanParam WorkspacedParams params) {
        final PanacheQuery<Wallet> query = Wallet.find("workspace.id = ?1", params.getSort(), params.workspaceId)
                .page(params.getPage());

        return PagedResponse.of(
                params.page,
                params.size,
                query.count(),
                query.stream().map(WalletDTOExpanded::from).toList()
        );
    }

    @Override
    protected void deleteById(final long id) {
        Wallet.deleteById(id);
    }

    @Override
    protected boolean hasDependents(final long id) {
        if (Transaction.count("wallet.id = ?1", id) > 0) return true;
        if (BookedAmount.count("wallet.id = ?1", id) > 0) return true;
        if (RecurringPayment.count("wallet.id = ?1", id) > 0) return true;
        return false;
    }

}
