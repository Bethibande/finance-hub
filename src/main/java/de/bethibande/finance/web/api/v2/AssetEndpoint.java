package de.bethibande.finance.web.api.v2;

import de.bethibande.finance.model.jpa.*;
import de.bethibande.finance.model.jpa.partner.Partner;
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

@Path("/api/v2/asset")
@RolesAllowed({Roles.ADMIN, Roles.USER})
public class AssetEndpoint extends AbstractCRUDEndpoint {

    @POST
    @Transactional
    public AssetDTO createAsset(final AssetDTOWithoutId dto) {
        final Asset asset = new Asset();
        asset.name = dto.name();
        asset.code = dto.code();
        asset.symbol = dto.symbol();
        asset.workspace = Workspace.findById(dto.workspaceId());
        asset.provider = Partner.findById(dto.providerId());

        if (asset.workspace == null) {
            throw new NotFoundException();
        }

        asset.persist();

        return AssetDTO.from(asset);
    }

    @PATCH
    @Transactional
    public AssetDTO updateAsset(final AssetDTOWithoutWorkspace dto) {
        final Asset asset = Asset.findById(dto.id());
        if (asset == null) throw new NotFoundException();

        asset.name = dto.name();
        asset.code = dto.code();
        asset.symbol = dto.symbol();
        asset.provider = Partner.findById(dto.providerId());

        if (asset.workspace == null) throw new NotFoundException();
        if (asset.provider == null && dto.providerId() != null) throw new NotFoundException();

        return AssetDTO.from(asset);
    }

    @GET
    @Transactional
    @Path("/{workspace_id}")
    public PagedResponse<AssetDTOExpanded> listAssets(final @BeanParam WorkspacedParams params) {
        final PanacheQuery<Asset> query = Asset.find("workspace.id = ?1", params.getSort(), params.workspaceId)
                .page(params.getPage());

        return PagedResponse.of(
                params.page,
                params.size,
                query.count(),
                query.stream().map(AssetDTOExpanded::from).toList()
        );
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
