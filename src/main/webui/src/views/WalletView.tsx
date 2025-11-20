import {defaultNamespacedLoadFunction, type EntityActions} from "./data/EntityDialog.tsx";
import {type Wallet, type Workspace} from "../lib/types.ts";
import {deleteClient, post} from "../lib/api.ts";
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

export const WalletActions: EntityActions<Wallet> = {
    load: defaultNamespacedLoadFunction("wallet"),
    create: (entity) => post("/api/v1/wallet", entity),
    save: (entity) => post("/api/v1/wallet", entity),
    delete: (entity) => deleteClient("/api/v1/wallet/" + entity.id),
    format: (entity) => entity.name,
    i18nKey: "wallet",
}

export function useWalletForm() {
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

    function toEntity(data: z.infer<typeof formSchema>, workspace: Workspace): Wallet {
        return {
            ...data,
            workspace: workspace
        }
    }

    function reset(entity?: Wallet) {
        form.reset(entity || defaultValues)
    }

    function fields() {
        return (
            <>
                <ControlledInput name={"name"}
                                 control={form.control}
                                 label={i18next.t("wallet.name")}
                                 placeholder={i18next.t("wallet.name.placeholder")}/>
                <div className={"flex gap-2"}>
                    <ControlledEntityComboBox name={"asset"}
                                              control={form.control}
                                              label={i18next.t("wallet.asset")}
                                              keyGenerator={AssetActions.format}
                                              actions={AssetActions}
                                              form={useAssetEditForm()}
                                              optional={true}
                                              placeholder={i18next.t("wallet.asset.placeholder")}/>
                    <ControlledEntityComboBox name={"provider"}
                                              control={form.control}
                                              label={i18next.t("wallet.provider")}
                                              keyGenerator={PartnerActions.format}
                                              actions={PartnerActions}
                                              form={usePartnerEditForm()}
                                              optional={true}
                                              placeholder={i18next.t("wallet.provider.placeholder")}/>
                </div>
                <ControlledTextArea name={"notes"}
                                    control={form.control}
                                    label={i18next.t("wallet.notes")}
                                    placeholder={i18next.t("wallet.notes.placeholder")}/>
            </>
        )
    }

    return {form, toEntity, reset, fields}
}

export function WalletView() {
    const columns: ColumnDef<Wallet>[] = [
        {
            id: "name",
            header: columnHeader(i18next.t("wallet.name")),
            accessorKey: "name",
        },
        {
            id: "asset",
            header: columnHeader(i18next.t("wallet.asset")),
            cell: ({row}) => row.original.asset ? AssetActions.format(row.original.asset) : "",
            accessorKey: "asset",
        },
        {
            id: "provider",
            header: columnHeader(i18next.t("wallet.provider")),
            cell: ({row}) => row.original.provider ? PartnerActions.format(row.original.provider) : "",
            accessorKey: "provider",
        },
        {
            id: "notes",
            header: i18next.t("wallet.notes"),
            accessorKey: "notes",
        }
    ]

    return (
        <EntityView actions={WalletActions}
                    columns={columns}
                    editForm={useWalletForm()}/>
    )
}