import {type DataQuery} from "@/components/data-table.tsx";
import type {ColumnDef} from "@tanstack/react-table";
import {type AssetDTOExpanded, AssetEndpointApi} from "@/generated";
import i18next from "i18next";
import {EntityList} from "@/components/entity/entity-list.tsx";
import {AssetFormExpanded} from "@/views/asset/AssetForm.tsx";

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

    function load(query: DataQuery) {
        return new AssetEndpointApi().apiV2AssetWorkspaceIdGet({
            page: query.page,
            sort: query.sort.map(o => JSON.stringify(o)),
            workspaceId: query.workspace.id!
        }).then((result) => ({
            data: result.data,
            total: result.totalElements,
            page: query.page,
        }))
    }

    return (
        <EntityList columns={columns}
                    load={load}
                    Form={AssetFormExpanded}
                    i18nKey={"asset"}/>
    )
}