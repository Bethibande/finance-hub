import {defaultNamespacedLoadFunction, type EntityActions} from "../data/EntityDialog.tsx";
import {type Transaction, TransactionStatus, TransactionType, type Workspace} from "@/lib/types.ts";
import {deleteClient, post} from "@/lib/api.ts";
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
import {useWalletForm, WalletActions} from "../WalletView.tsx";
import {PartnerActions, usePartnerEditForm} from "../partners/PartnerView.tsx";
import {columnHeader} from "../../components/ui/table.tsx";
import {renderAmount, renderDate} from "../../components/table/data-table.tsx";
import type {ClassNameValue} from "tailwind-merge";
import {useState} from "react";
import {BookingDialog} from "./Booking.tsx";
import {Item, ItemContent, ItemDescription, ItemMedia, ItemTitle} from "../../components/ui/item.tsx";
import {Archive, Clipboard, ClipboardCheck} from "react-bootstrap-icons";
import {cn} from "@/lib/utils.ts";
import {Button} from "@/components/ui/button.tsx";

export interface TransactionItemProps {
    transaction: Transaction;
}

export const StatusToIcon = {
    OPEN: <Clipboard/>,
    CANCELLED: <Archive/>,
    CLOSED: <ClipboardCheck/>,
}

export function TransactionItem(props: TransactionItemProps) {
    const {transaction} = props;

    return (
        <Item variant={"outline"}>
            <ItemMedia className={"border rounded-md p-1"}>
                <span className={"text-xl"}>{StatusToIcon[transaction.status]}</span>
            </ItemMedia>
            <ItemContent>
                <ItemTitle>{transaction.name}</ItemTitle>
                <ItemDescription>
                    <span
                        className={"flex gap-1 text-black"}>{renderAmount(transaction.amount)} {AssetActions.format(transaction.asset)}</span>
                </ItemDescription>
            </ItemContent>
            <ItemContent>
                <ItemDescription>
                    <p className={"text-right"}>
                        {WalletActions.format(transaction.wallet)}
                    </p>
                    <p className={"text-right"}>
                        {new Date(transaction.date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "2-digit",
                            year: "numeric"
                        })}
                    </p>
                </ItemDescription>
            </ItemContent>
        </Item>
    )
}

export const TransactionActions: EntityActions<Transaction> = {
    load: defaultNamespacedLoadFunction("transaction"),
    create: (entity) => post("/api/v1/transaction", entity),
    save: (entity) => post("/api/v1/transaction", entity),
    delete: (entity) => deleteClient("/api/v1/transaction/" + entity.id),
    format: (entity) => entity.name,
    i18nKey: "transaction"
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
                                              keyGenerator={asset => asset.name}
                                              actions={AssetActions}
                                              form={useAssetEditForm()}/>
                </div>
                <div className={"flex gap-2"}>
                    <ControlledEntityComboBox name={"wallet"}
                                              control={form.control}
                                              label={i18next.t("transaction.wallet")}
                                              keyGenerator={wallet => wallet.name}
                                              actions={WalletActions}
                                              form={useWalletForm()}/>
                    <ControlledEntityComboBox name={"partner"}
                                              control={form.control}
                                              label={i18next.t("transaction.partner")}
                                              keyGenerator={partner => partner.name}
                                              actions={PartnerActions}
                                              optional={true}
                                              form={usePartnerEditForm()}/>
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

function renderBookingStatus(transaction: Transaction, edit: (transaction: Transaction) => void) {
    return (
        <Button variant={"ghost"} onClick={() => edit(transaction)}>
            {i18next.t("transaction.booked", {amount: transaction.bookedAmounts.length})}
        </Button>
    )
}

function renderStatus(transaction: Transaction) {
    let color: ClassNameValue = "";
    switch (transaction.status) {
        case TransactionStatus.OPEN:
            color = "text-green-500"
            break;
        case TransactionStatus.CLOSED:
            color = "text-gray-500"
            break;
        case TransactionStatus.CANCELLED:
            color = "text-orange-500"
            break;
    }

    return (
        <span className={cn(color, "flex gap-1 items-center")}>{StatusToIcon[transaction.status]} {i18next.t("TransactionStatus." + transaction.status)}</span>
    )
}

export function TransactionView() {
    const [editBookings, setEditBookings] = useState<Transaction | null>(null)

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
            cell: ({row}) => renderStatus(row.original),
            accessorKey: "status",
            enableSorting: true,
        },
        {
            id: "booked",
            header: i18next.t("transaction.bookedAmounts"),
            cell: ({row}) => renderBookingStatus(row.original, setEditBookings),
            accessorKey: "status",
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
        <>
            {editBookings && <BookingDialog transaction={editBookings} open={true} setOpen={() => setEditBookings(null)}
                                            onChange={() => {
                                            }}/>}
            <EntityView actions={TransactionActions}
                        columns={columns}
                        editForm={useTransactionForm()}/>
        </>
    )
}