import {type EntityFunctions, listV2} from "@/components/entity/entity-functions.ts";
import {type BookedAmountDTO, BookedAmountEndpointApi} from "@/generated";

export const BookedAmountAPI = new BookedAmountEndpointApi();

export function createBookedAmountFunctions(transactionId: number): EntityFunctions<BookedAmountDTO, number> {
    return {
        list: listV2(query => BookedAmountAPI.apiV2BookedamountTransactionTransactionIdGet({
            transactionId,
            page: query.page,
            size: 10,
            sort: query.sort,
        })),
        delete: id => BookedAmountAPI.apiV2BookedamountIdDelete({id}),
        toId: b => b.id!,
        format: b => b.amount?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) + " " + b.asset?.code + " @ " + b.date?.toLocaleString(undefined, {day: "2-digit", month: "short", year: "numeric"})
    }
}