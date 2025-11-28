package de.bethibande.finance.web.api.v2;

import de.bethibande.finance.model.jpa.Asset;
import de.bethibande.finance.model.jpa.Workspace;
import de.bethibande.finance.model.jpa.WorkspaceDTO;
import de.bethibande.finance.model.jpa.WorkspaceDTOWithoutId;
import de.bethibande.finance.model.web.PagedResponse;
import de.bethibande.finance.security.Roles;
import de.bethibande.finance.web.api.v2.crud.AbstractCRUDEndpoint;
import de.bethibande.finance.web.api.v2.crud.PaginationParams;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import jakarta.annotation.security.RolesAllowed;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;

@Path("/api/v2/workspace")
@RolesAllowed({Roles.ADMIN, Roles.USER})
public class WorkspaceEndpoint extends AbstractCRUDEndpoint {

    @POST
    @Transactional
    public WorkspaceDTO createWorkspace(final WorkspaceDTOWithoutId dto) {
        final Workspace workspace = new Workspace();
        workspace.name = dto.name();

        workspace.persist();
        return WorkspaceDTO.from(workspace);
    }

    @PATCH
    @Transactional
    public WorkspaceDTO updateWorkspace(final WorkspaceDTO dto) {
        final Workspace workspace = Workspace.findById(dto.id());
        if (workspace == null) throw new NotFoundException();

        workspace.name = dto.name();

        return WorkspaceDTO.from(workspace);
    }

    @GET
    @Transactional
    public PagedResponse<WorkspaceDTO> listWorkspaces(final @BeanParam PaginationParams params) {
        final PanacheQuery<Workspace> query = Workspace.findAll(params.getSort())
                .page(params.getPage());

        return PagedResponse.of(
                params.page,
                params.size,
                query.count(),
                query.stream().map(WorkspaceDTO::from).toList()
        );
    }

    @Override
    protected boolean hasDependents(final long id) {
        // All workspace-bound entities directly or indirectly depend on an asset, if there are no assets, then the workspace is empty
        return Asset.find("workspace.id = ?1", id).count() > 0;
    }

    @Override
    protected void deleteById(final long id) {
        Workspace.deleteById(id);
    }
}
