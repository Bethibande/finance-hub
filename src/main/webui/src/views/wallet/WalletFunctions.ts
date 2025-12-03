import {type WalletDTOExpanded, WalletEndpointApi} from "@/generated";
import {type EntityFunctions, listV2} from "@/components/entity/entity-functions.ts";

export const WalletAPI = new WalletEndpointApi()

export const WalletFunctions: EntityFunctions<WalletDTOExpanded, number> = {
    list: listV2(WalletAPI.apiV2WalletWorkspaceIdGet.bind(WalletAPI)),
    delete: id => WalletAPI.apiV2WalletIdDelete({id}),
    format: w => w.name,
    toId: w => w.id!
}
