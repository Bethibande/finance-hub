import {EntityList} from "@/components/entity/entity-list.tsx";
import {RecurringPaymentFunctions} from "@/views/recurring/RecurringPaymentFunctions.ts";
import {RecurringPaymentsForm} from "@/views/recurring/RecurringPaymentsForm.tsx";
import type {ColumnDef} from "@tanstack/react-table";
import type {RecurringPaymentDTO} from "@/generated";
import i18next from "i18next";
import {renderAmount, renderDate} from "@/components/data-table.tsx";

export function RecurringPaymentsView() {
    const columns: ColumnDef<RecurringPaymentDTO>[] = [
        {
            id: "name",
            header: i18next.t("recurring.name"),
            accessorKey: "name",
            enableSorting: true,
        },
        {
            id: "status",
            header: i18next.t("recurring.status"),
            cell: ({row}) => i18next.t("RecurringPaymentStatus." + row.original.status),
            accessorKey: "status",
            enableSorting: true,
        },
        {
            id: "amount",
            header: i18next.t("recurring.amount"),
            cell: ({row}) => renderAmount(row.original.amount),
            accessorKey: "amount",
            enableSorting: true,
        },
        {
            id: "asset.id",
            header: i18next.t("recurring.asset"),
            cell: ({row}) => (<p>{row.original.asset?.code}</p>),
            accessorKey: "asset",
            enableSorting: true,
        },
        {
            id: "wallet.id",
            header: i18next.t("recurring.wallet"),
            cell: ({row}) => (<p>{row.original.wallet?.name}</p>),
            accessorKey: "wallet",
            enableSorting: true,
        },
        {
            id: "nextDate",
            header: i18next.t("recurring.nextDate"),
            cell: ({row}) => (renderDate(row.original.nextPaymentDate)),
            accessorKey: "asset",
            enableSorting: false
        },
    ]

    return (
        <EntityList functions={RecurringPaymentFunctions}
                    columns={columns}
                    i18nKey={"recurring"}
                    Form={RecurringPaymentsForm}/>
    )
}