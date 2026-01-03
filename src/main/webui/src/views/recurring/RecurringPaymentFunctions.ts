import {type RecurringPaymentDTO, RecurringPaymentEndpointApi} from "@/generated";
import {type EntityFunctions, listV2} from "@/components/entity/entity-functions.ts";

export const RecurringPaymentApi = new RecurringPaymentEndpointApi();

export const RecurringPaymentFunctions: EntityFunctions<RecurringPaymentDTO, number> = {
    list: listV2(RecurringPaymentApi.apiV2RecurringWorkspaceIdGet.bind(RecurringPaymentApi)),
    delete: (id) => RecurringPaymentApi.apiV2RecurringIdDelete({id}),
    toId: e => e.id!,
    format: e => e.name,
}