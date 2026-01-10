import {type EntityFunctions, listV2} from "@/components/entity/entity-functions.ts";
import {type WorkspaceDTO, WorkspaceEndpointApi} from "@/generated";

export const WorkspaceApi = new WorkspaceEndpointApi()

export const WorkspaceFunctions: EntityFunctions<WorkspaceDTO, number> = {
    list: listV2(WorkspaceApi.apiV2WorkspaceGet.bind(WorkspaceApi)),
    delete: id => WorkspaceApi.apiV1WorkspaceIdDelete({id}),
    format: e => e.name,
    toId: e => e.id!,
}