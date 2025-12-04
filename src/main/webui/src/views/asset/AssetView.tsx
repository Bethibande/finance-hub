import type {ColumnDef} from "@tanstack/react-table";
import {type AssetDTOExpanded, AssetEndpointApi} from "@/generated";
import i18next from "i18next";
import {EntityList} from "@/components/entity/entity-list.tsx";
import {AssetFormExpanded} from "@/views/asset/AssetForm.tsx";
import {type EntityFunctions, listV2} from "@/components/entity/entity-functions.ts";

export const AssetAPI = new AssetEndpointApi()

export const AssetFunctions: EntityFunctions<AssetDTOExpanded, number> = {
    list: listV2(AssetAPI.apiV2AssetWorkspaceIdGet.bind(AssetAPI)),
    delete: id => AssetAPI.apiV2AssetIdDelete({id}),
    format: a => a.code,
    toId: a => a.id!,
}

export function AssetView() {
    const columns: ColumnDef<AssetDTOExpanded>[] = [
        {
            id: "name",
            header: i18next.t("asset.name"),
            accessorKey: "name",
            enableSorting: true,
        },
        {
            id: "code",
            header: i18next.t("asset.code"),
            accessorKey: "code",
            enableSorting: true,
        },
        {
            id: "symbol",
            header: i18next.t("asset.symbol"),
            accessorKey: "symbol",
            enableSorting: true,
        },
        {
            id: "provider",
            header: i18next.t("asset.provider"),
            accessorKey: "provider",
            cell: ({row}) => (<p>{row.original.provider?.name}</p>)
        },
        {
            id: "notes",
            header: i18next.t("asset.notes"),
            accessorKey: "notes",
        }
    ]

    return (
        <EntityList columns={columns}
                    functions={AssetFunctions}
                    Form={AssetFormExpanded}
                    i18nKey={"asset"}/>
    )
}