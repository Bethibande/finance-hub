import type {ColumnDef} from "@tanstack/react-table";
import type {TransactionDTOExpanded} from "@/generated";
import i18next from "i18next";
import {EntityList} from "@/components/entity/entity-list.tsx";
import {TransactionFunctions} from "@/views/payments/TransactionFunctions.ts";
import {TransactionFormExpanded} from "@/views/payments/TransactionForm.tsx";
import {renderAmount, renderDate} from "@/components/data-table.tsx";

export function TransactionView() {
    const columns: ColumnDef<TransactionDTOExpanded>[] = [
        {
            id: "name",
            accessorKey: "name",
            header: i18next.t("transaction.name"),
            enableSorting: true,
        },
        {
            id: "status",
            accessorKey: "status",
            header: i18next.t("transaction.status"),
            cell: ({row}) => i18next.t("TransactionStatus." + row.original.status),
            enableSorting: true,
        },
        {
            id: "amount",
            accessorKey: "amount",
            header: i18next.t("transaction.amount"),
            cell: ({row}) => renderAmount(row.original.amount),
            enableSorting: true,
        },
        {
            id: "asset",
            accessorKey: "asset",
            header: i18next.t("transaction.asset"),
            cell: ({row}) => row.original.asset?.code,
            enableSorting: true,
        },
        {
            id: "date",
            accessorKey: "date",
            header: i18next.t("transaction.date"),
            cell: ({row}) => renderDate(row.original.date),
            enableSorting: true,
        },
        {
            id: "wallet",
            accessorKey: "wallet",
            header: i18next.t("transaction.wallet"),
            cell: ({row}) => row.original.wallet?.name,
            enableSorting: true,
        },
    ]

    return (
        <EntityList functions={TransactionFunctions}
                    columns={columns}
                    i18nKey={"transaction"}
                    Form={TransactionFormExpanded}/>
    )
}