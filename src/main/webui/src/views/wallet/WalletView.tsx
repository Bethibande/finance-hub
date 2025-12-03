import {EntityList} from "@/components/entity/entity-list.tsx";
import {WalletFunctions} from "@/views/wallet/WalletFunctions.ts";
import {WalletFormExpanded} from "@/views/wallet/WalletForm.tsx";
import type {ColumnDef} from "@tanstack/react-table";
import type {WalletDTOExpanded} from "@/generated";
import i18next from "i18next";

export function WalletView() {
    const columns: ColumnDef<WalletDTOExpanded>[] = [
        {
            id: "name",
            accessorKey: "name",
            header: i18next.t("wallet.name"),
            enableSorting: true,
        },
        {
            id: "asset",
            accessorKey: "asset",
            cell: ({row}) => row.original?.asset?.name,
            header: i18next.t("wallet.asset"),
            enableSorting: true,
        },
        {
            id: "provider",
            accessorKey: "provider",
            cell: ({row}) => row.original?.provider?.name,
            header: i18next.t("wallet.provider"),
            enableSorting: true,
        },
        {
            id: "notes",
            accessorKey: "notes",
            header: i18next.t("wallet.notes"),
        }
    ]
    return (
        <EntityList functions={WalletFunctions}
                    columns={columns}
                    i18nKey={"wallet"}
                    Form={WalletFormExpanded}/>
    )
}