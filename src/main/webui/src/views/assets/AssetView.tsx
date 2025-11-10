import type {ColumnDef} from "@tanstack/react-table";
import type {Asset, Workspace} from "../../lib/types.ts";
import i18next from "i18next";
import {columnHeader} from "../../components/ui/table.tsx";
import {EntityView} from "../data/EntityView.tsx";
import {deleteClient, fetchClient, post} from "../../lib/api.ts";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {type EntityActions} from "../data/EntityDialog.tsx";
import {ControlledEntityComboBox, ControlledInput, ControlledTextArea} from "../../components/ControlledInput.tsx";
import {PartnerActions, usePartnerEditForm} from "../partners/Partners.tsx";

export const AssetActions: EntityActions<Asset> = {
    load: (workspace, page, size) => fetchClient("/api/v1/asset/workspace/" + workspace.id + "?page=" + page + "&size=" + size),
    create: (asset) => post("/api/v1/asset", asset),
    delete: (asset) => deleteClient("/api/v1/asset/" + asset.id),
    save: (asset) => post("/api/v1/asset", asset),
    format: (asset) => {
        if (asset.provider) {
            return asset.name + " @ " + asset.provider.name
        }
        return asset.name
    }
}

export function useAssetEditForm() {
    const formSchema = z.object({
        name: z.string().min(3).max(255),
        provider: z.any().nullable(),
        code: z.string().min(3).max(8),
        symbol: z.string().min(1).max(10).nullable(),
        notes: z.string().min(0).max(1024).nullable(),
    })

    const defaultValues = {
        name: "",
        provider: null,
        code: "",
        symbol: null,
        notes: null
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues
    })

    function toEntity(data: z.infer<typeof formSchema>, workspace: Workspace): Asset {
        return {
            ...data,
            workspace: workspace
        }
    }

    function fields() {
        return (
            <>
                <div className={"flex gap-2"}>
                    <ControlledInput name={"name"}
                                     control={form.control}
                                     placeholder={"Euro"}
                                     label={i18next.t("asset.name")}/>
                    <ControlledEntityComboBox name={"provider"}
                                              control={form.control}
                                              placeholder={"Apple inc."}
                                              optional={true}
                                              actions={PartnerActions}
                                              form={usePartnerEditForm()}
                                              i18nKey={"partner"}
                                              render={option => option.name}
                                              keyGenerator={option => option.name}
                                              label={i18next.t("asset.provider")}/>
                </div>
                <div className={"flex gap-2"}>
                    <ControlledInput name={"code"}
                                     control={form.control}
                                     placeholder={"EUR"}
                                     label={i18next.t("asset.code")}/>
                    <ControlledInput name={"symbol"}
                                     control={form.control}
                                     placeholder={"€"}
                                     label={i18next.t("asset.symbol")}/>
                </div>
                <ControlledTextArea name={"notes"}
                                    control={form.control}
                                    placeholder={i18next.t("asset.notes.placeholder")}
                                    label={i18next.t("asset.notes")}/>
            </>
        )
    }

    function reset(entity?: Asset) {
        form.reset(entity || defaultValues)
    }

    return {form, toEntity, reset, fields}
}

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
            id: "provider",
            header: columnHeader(i18next.t("asset.provider")),
            accessorKey: "provider.name",
            enableSorting: true,
            sortingFn: "text"
        },
        {
            id: "notes",
            header: i18next.t("asset.notes"),
            accessorKey: "notes",
        }
    ]

    return (
        <EntityView i18nKey={"asset"}
                    actions={AssetActions}
                    columns={columns}
                    editForm={useAssetEditForm()}/>
    )
}
