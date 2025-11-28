import {type DataQuery, DataTable, type TableData} from "@/components/data-table.tsx";
import type {ColumnDef} from "@tanstack/react-table";
import {type AssetDTOExpanded, AssetEndpointApi} from "@/generated";
import {useState} from "react";
import {useWorkspace} from "@/lib/workspace.tsx";
import {showError} from "@/lib/errors.tsx";
import i18next from "i18next";

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
    const [data, setData] = useState<TableData<AssetDTOExpanded>>({
        data: [],
        page: 0,
        total: 0
    })

    const {workspace} = useWorkspace();

    function load(query: DataQuery) {
        new AssetEndpointApi().apiV2AssetWorkspaceIdGet({
            page: query.page,
            sort: query.sort.map(o => JSON.stringify(o)),
            workspaceId: workspace.id!
        }).then((result) => {
            setData({
                data: result.data,
                total: result.totalElements,
                page: query.page,
            })
        }).catch(showError)
    }

    return (
        <DataTable pagination={true}
                   data={data}
                   columns={columns}
                   update={load}/>
    )
}