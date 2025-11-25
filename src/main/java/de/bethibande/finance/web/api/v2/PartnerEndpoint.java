package de.bethibande.finance.web.api.v2;

import de.bethibande.finance.model.jpa.Asset;
import de.bethibande.finance.model.jpa.Wallet;
import de.bethibande.finance.model.jpa.Workspace;
import de.bethibande.finance.model.jpa.partner.Partner;
import de.bethibande.finance.model.jpa.partner.PartnerDTO;
import de.bethibande.finance.model.jpa.partner.PartnerDTOWithoutId;
import de.bethibande.finance.model.jpa.partner.PartnerDTOWithoutWorkspace;
import de.bethibande.finance.model.jpa.transaction.Transaction;
import de.bethibande.finance.model.web.PagedResponse;
import de.bethibande.finance.web.api.v2.crud.AbstractCRUDEndpoint;
import de.bethibande.finance.web.api.v2.crud.WorkspacedParams;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;

@Path("/api/v2/partner")
public class PartnerEndpoint extends AbstractCRUDEndpoint {

    @POST
    @Transactional
    public PartnerDTO createPartner(final PartnerDTOWithoutId dto) {
        final Partner partner = new Partner();
        partner.name = dto.name();
        partner.type = dto.type();
        partner.notes = dto.notes();
        partner.workspace = Workspace.findById(dto.workspaceId());

        if (partner.workspace == null) throw new NotFoundException();

        partner.persist();

        return PartnerDTO.from(partner);
    }

    @PATCH
    @Transactional
    public PartnerDTO updatePartner(final PartnerDTOWithoutWorkspace dto) {
        final Partner partner = Partner.findById(dto.id());
        if (partner == null) throw new NotFoundException();

        partner.name = dto.name();
        partner.type = dto.type();
        partner.notes = dto.notes();

        return PartnerDTO.from(partner);
    }

    @GET
    @Transactional
    @Path("/{workspace_id}")
    public PagedResponse<PartnerDTO> listPartners(final @BeanParam WorkspacedParams params) {
        final PanacheQuery<Partner> query = Partner.find("workspace.id = ?1", params.getSort(), params.workspaceId)
                .page(params.getPage());

        return PagedResponse.of(
                params.page,
                params.size,
                query.count(),
                query.stream().map(PartnerDTO::from).toList()
        );
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
