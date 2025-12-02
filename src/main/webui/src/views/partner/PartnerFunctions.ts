import {type EntityFunctions, listV2} from "@/components/entity/entity-functions.ts";
import {type PartnerDTO, PartnerEndpointApi} from "@/generated";

export const PartnerAPI = new PartnerEndpointApi();

export const PartnerFunctions: EntityFunctions<PartnerDTO, number> = {
    list: listV2(PartnerAPI.apiV2PartnerWorkspaceIdGet.bind(PartnerAPI)),
    delete: id => PartnerAPI.apiV2PartnerIdDelete({id}),
    format: p => p.name,
    toId: p => p.id!,
}