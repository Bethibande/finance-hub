import type {EntityActions} from "../data/EntityDialog.tsx";
import {type Transaction, TransactionStatus, TransactionType, type Workspace} from "../../lib/types.ts";
import {deleteClient, fetchClient, post} from "../../lib/api.ts";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {EntityView} from "../data/EntityView.tsx";
import {type ColumnDef} from "@tanstack/react-table";
import {
    ControlledDateInput,
    ControlledEntityComboBox,
    ControlledInput,
    ControlledNumberInput,
    ControlledSelect,
    ControlledTextArea
} from "../../components/ControlledInput.tsx";
import i18next from "i18next";
import {AssetActions, useAssetEditForm} from "../assets/AssetView.tsx";
import {WalletActions, useWalletForm} from "../WalletView.tsx";
import {PartnerActions, usePartnerEditForm} from "../partners/PartnerView.tsx";
import {columnHeader} from "../../components/ui/table.tsx";
import {renderAmount, renderDate} from "../../components/table/data-table.tsx";
import type {ClassNameValue} from "tailwind-merge";

export const TransactionActions: EntityActions<Transaction> = {
    load: (workspace, page, size) => fetchClient("/api/v1/transaction/workspace/" + workspace.id + "?page=" + page + "&size=" + size),
    create: (entity) => post("/api/v1/transaction", entity),
    save: (entity) => post("/api/v1/transaction", entity),
    delete: (entity) => deleteClient("/api/v1/transaction/" + entity.id),
    format: (entity) => entity.name,
}

export function useTransactionForm() {
    const formSchema = z.object({
        name: z.string().min(3).max(255),
        amount: z.number(),
        asset: z.any().nullable(),
        date: z.date(),
        status: z.enum(TransactionStatus),
        wallet: z.any().nullable(),
        partner: z.any().nullable(),
        notes: z.string().max(1024).nullable(),
    })

    const defaultValues: z.infer<typeof formSchema> = {
        name: "",
        amount: 0.0,
        asset: null,
        date: new Date(),
        status: TransactionStatus.OPEN,
        wallet: null,
        partner: null,
        notes: "",
    }

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues
    });

    function toEntity(data: z.infer<typeof formSchema>, workspace: Workspace): Transaction {
        return {
            ...data,
            date: data.date.toISOString(),
            asset: data.asset!,
            wallet: data.wallet!,
            workspace: workspace,
            type: TransactionType.PAYMENT,
            bookedAmounts: [],
            internalRef: null,
        }
    }

    function reset(entity?: Transaction) {
        form.reset(entity ? {...entity, date: new Date(entity.date)} : defaultValues);
    }

    function fields() {
        return (
            <>
                <div className={"flex gap-2"}>
                    <ControlledInput name={"name"}
                                     control={form.control}
                                     label={i18next.t("transaction.name")}/>
                    <ControlledDateInput name={"date"}
                                         control={form.control}
                                         label={i18next.t("transaction.date")}/>

                </div>
                <div className={"flex gap-2"}>
                    <ControlledNumberInput name={"amount"}
                                           control={form.control}
                                           label={i18next.t("transaction.amount")}/>
                    <ControlledEntityComboBox name={"asset"}
                                              control={form.control}
                                              label={i18next.t("transaction.asset")}
                                              render={AssetActions.format}
                                              keyGenerator={asset => asset.name}
                                              actions={AssetActions}
                                              form={useAssetEditForm()}
                                              i18nKey={"asset"}/>
                </div>
                <div className={"flex gap-2"}>
                    <ControlledEntityComboBox name={"wallet"}
                                              control={form.control}
                                              label={i18next.t("transaction.wallet")}
                                              render={WalletActions.format}
                                              keyGenerator={wallet => wallet.name}
                                              actions={WalletActions}
                                              form={useWalletForm()}
                                              i18nKey={"wallet"}/>
                    <ControlledEntityComboBox name={"partner"}
                                              control={form.control}
                                              label={i18next.t("transaction.partner")}
                                              render={PartnerActions.format}
                                              keyGenerator={partner => partner.name}
                                              actions={PartnerActions}
                                              optional={true}
                                              form={usePartnerEditForm()}
                                              i18nKey={"partner"}/>
                </div>
                <ControlledSelect name={"status"}
                                  control={form.control}
                                  label={i18next.t("transaction.status")}
                                  options={Object.keys(TransactionStatus)}
                                  render={status => i18next.t("TransactionStatus." + status)}
                                  keyGenerator={status => status}/>
                <ControlledTextArea name={"notes"}
                                    control={form.control}
                                    label={i18next.t("transaction.notes")}/>
            </>
        )
    }

    return {form, toEntity, reset, fields}
}

function renderStatus(status: TransactionStatus) {
    let color: ClassNameValue = "";
    switch (status) {
        case TransactionStatus.OPEN:
            color = "text-green-600"
            break;
        case TransactionStatus.CLOSED:
            color = "text-gray-600"
            break;
        case TransactionStatus.CANCELLED:
            color = "text-orange-600"
            break;
    }
    return (
        <span className={color}>{i18next.t("TransactionStatus." + status)}</span>
    )
}

export function TransactionView() {
    const columns: ColumnDef<Transaction>[] = [
        {
            id: "name",
            header: columnHeader(i18next.t("transaction.name")),
            accessorKey: "name",
            enableSorting: true,
        },
        {
            id: "status",
            header: columnHeader(i18next.t("transaction.status")),
            cell: ({row}) => renderStatus(row.original.status),
            accessorKey: "status",
            enableSorting: true,
        },
        {
            id: "amount",
            header: columnHeader(i18next.t("transaction.amount")),
            cell: ({row}) => renderAmount(row.original.amount),
            accessorKey: "amount",
            enableSorting: true,
            sortingFn: (rowA, rowB) => rowA.original.amount - rowB.original.amount,
        },
        {
            id: "asset",
            header: i18next.t("transaction.asset"),
            cell: ({row}) => row.original.asset.code,
            accessorKey: "asset",
        },
        {
            id: "date",
            header: columnHeader(i18next.t("transaction.date")),
            cell: ({row}) => renderDate(row.original.date),
            accessorKey: "date",
            enableSorting: true,
        },
        {
            id: "partner",
            header: i18next.t("transaction.partner"),
            cell: ({row}) => row.original.partner && PartnerActions.format(row.original.partner),
        },
        {
            id: "wallet",
            header: i18next.t("transaction.wallet"),
            cell: ({row}) => row.original.wallet && WalletActions.format(row.original.wallet),
            accessorKey: "wallet",
        }
    ]

    return (
        <EntityView actions={TransactionActions}
                    columns={columns}
                    i18nKey={"transaction"}
                    editForm={useTransactionForm()}/>
    )
}