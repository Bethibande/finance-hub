import {type EntityListFunctions, listV2} from "@/components/entity/entity-functions.ts";
import {type PartnerDTO, PartnerEndpointApi} from "@/generated";

export const PartnerListFunctions: EntityListFunctions<PartnerDTO, number> = {
    list: listV2(new PartnerEndpointApi().apiV2PartnerWorkspaceIdGet),
    format: p => p.name,
    toId: p => p.id!,
}