import type {EntityActions} from "./data/EntityDialog.tsx";
import type {Depot, Workspace} from "../lib/types.ts";
import {deleteClient, fetchClient, post} from "../lib/api.ts";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {EntityView} from "./data/EntityView.tsx";
import type {ColumnDef} from "@tanstack/react-table";
import {ControlledEntityComboBox, ControlledInput, ControlledTextArea} from "../components/ControlledInput.tsx";
import i18next from "i18next";
import {AssetActions, useAssetEditForm} from "./assets/AssetView.tsx";
import {PartnerActions, usePartnerEditForm} from "./partners/PartnerView.tsx";
import {columnHeader} from "../components/ui/table.tsx";

export const DepotActions: EntityActions<Depot> = {
    load: (workspace, page, size) => fetchClient("/api/v1/depot/workspace/" + workspace.id + "?page=" + page + "&size=" + size),
    create: (entity) => post("/api/v1/depot", entity),
    save: (entity) => post("/api/v1/depot", entity),
    delete: (entity) => deleteClient("/api/v1/depot/" + entity.id),
    format: (entity) => entity.name
}

export function useDepotForm() {
    const formSchema = z.object({
        name: z.string().min(3).max(255),
        notes: z.string().min(3).max(255).nullable(),
        asset: z.any().nullable(),
        provider: z.any().nullable(),
    })

    const defaultValues = {
        name: "",
        notes: null,
        asset: null,
        provider: null,
    }

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues,
    })

    function toEntity(data: z.infer<typeof formSchema>, workspace: Workspace): Depot {
        return {
            ...data,
            workspace: workspace
        }
    }

    function reset(entity?: Depot) {
        form.reset(entity || defaultValues)
    }

    function fields() {
        return (
            <>
                <ControlledInput name={"name"}
                                 control={form.control}
                                 label={i18next.t("depot.name")}
                                 placeholder={i18next.t("depot.name.placeholder")}/>
                <div className={"flex gap-2"}>
                    <ControlledEntityComboBox name={"asset"}
                                              control={form.control}
                                              label={i18next.t("depot.asset")}
                                              render={AssetActions.format}
                                              keyGenerator={AssetActions.format}
                                              actions={AssetActions}
                                              form={useAssetEditForm()}
                                              optional={true}
                                              placeholder={i18next.t("depot.asset.placeholder")}
                                              i18nKey={"asset"}/>
                    <ControlledEntityComboBox name={"provider"}
                                              control={form.control}
                                              label={i18next.t("depot.provider")}
                                              render={PartnerActions.format}
                                              keyGenerator={PartnerActions.format}
                                              actions={PartnerActions}
                                              form={usePartnerEditForm()}
                                              optional={true}
                                              placeholder={i18next.t("depot.provider.placeholder")}
                                              i18nKey={"partner"}/>
                </div>
                <ControlledTextArea name={"notes"}
                                    control={form.control}
                                    label={i18next.t("depot.notes")}
                                    placeholder={i18next.t("depot.notes.placeholder")}/>
            </>
        )
    }

    return {form, toEntity, reset, fields}
}

export function DepotView() {
    const columns: ColumnDef<Depot>[] = [
        {
            id: "name",
            header: columnHeader(i18next.t("depot.name")),
            accessorKey: "name",
            enableSorting: true,
        },
        {
            id: "asset",
            header: columnHeader(i18next.t("depot.asset")),
            cell: ({row}) => row.original.asset ? AssetActions.format(row.original.asset) : "",
            accessorKey: "asset",
            enableSorting: true,
        },
        {
            id: "provider",
            header: columnHeader(i18next.t("depot.provider")),
            cell: ({row}) => row.original.provider ? PartnerActions.format(row.original.provider) : "",
            accessorKey: "provider",
            enableSorting: true,
        },
        {
            id: "notes",
            header: i18next.t("depot.notes"),
            accessorKey: "notes",
        }
    ]

    return (
        <EntityView actions={DepotActions}
                    columns={columns}
                    i18nKey={"depot"}
                    editForm={useDepotForm()}/>
    )
}