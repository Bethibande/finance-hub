package de.bethibande.finance.web.api.v2;

import jakarta.ws.rs.PathParam;

public class WorkspacedParams extends PaginationParams {

    @PathParam("workspace_id")
    public long workspaceId;

}
