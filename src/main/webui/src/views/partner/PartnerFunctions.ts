import {type EntityListFunctions, listV2} from "@/components/entity/entity-functions.ts";
import {type PartnerDTO, PartnerEndpointApi} from "@/generated";

export const PartnerAPI = new PartnerEndpointApi();

export const PartnerListFunctions: EntityListFunctions<PartnerDTO, number> = {
    list: listV2(PartnerAPI.apiV2PartnerWorkspaceIdGet.bind(PartnerAPI)),
    format: p => p.name,
    toId: p => p.id!,
}