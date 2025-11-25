package de.bethibande.finance.web.api.v2.crud;

import jakarta.ws.rs.PathParam;

public class WorkspacedParams extends PaginationParams {

    @PathParam("workspace_id")
    public long workspaceId;

}
