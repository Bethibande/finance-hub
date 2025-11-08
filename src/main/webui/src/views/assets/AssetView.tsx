import type {ColumnDef} from "@tanstack/react-table";
import type {Asset} from "../../lib/types.ts";
import i18next from "i18next";
import {columnHeader} from "../../components/ui/table.tsx";
import {type EntityActions, EntityView} from "../data/EntityView.tsx";
import AssetEditDialog from "./AssetEditDialog.tsx";
import {useWorkspace} from "../../lib/workspace.tsx";
import {deleteClient, fetchClient, post} from "../../lib/api.ts";

export default function AssetView() {
    const columns: ColumnDef<Asset>[] = [
        {
            id: "name",
            header: columnHeader(i18next.t("asset.name")),
            accessorKey: "name",
            enableSorting: true,
            sortingFn: "text"
        },
        {
            id: "code",
            header: columnHeader(i18next.t("asset.code")),
            accessorKey: "code",
            enableSorting: true,
            sortingFn: "alphanumeric"
        },
        {
            id: "symbol",
            header: columnHeader(i18next.t("asset.symbol")),
            accessorKey: "symbol",
            enableSorting: true,
            sortingFn: "alphanumeric"
        },
        {
            id: "notes",
            header: i18next.t("asset.notes"),
            accessorKey: "notes",
        }
    ]

    const {workspace} = useWorkspace()

    const actions: EntityActions<Asset> = {
        load: () => fetchClient("/api/v1/asset/workspace/" + workspace.id),
        create: (asset) => post("/api/v1/asset", asset),
        delete: (asset) => deleteClient("/api/v1/asset/" + asset.id),
        save: (asset) => post("/api/v1/asset", asset)
    }

    return (
        <EntityView i18nKey={"asset"} actions={actions} columns={columns} editDialog={AssetEditDialog}/>
    )
}
