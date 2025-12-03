import {type TransactionDTOExpanded, TransactionEndpointApi} from "@/generated";
import {type EntityFunctions, listV2} from "@/components/entity/entity-functions.ts";

export const TransactionAPI = new TransactionEndpointApi();

export const TransactionFunctions: EntityFunctions<TransactionDTOExpanded, number> = {
    list: listV2(TransactionAPI.apiV2TransactionWorkspaceIdGet.bind(TransactionAPI)),
    delete: id => TransactionAPI.apiV2TransactionIdDelete({id}),
    format: t => t.name,
    toId: t => t.id!,
}
