import type {ColumnDef} from "@tanstack/react-table";
import {
    type BookedAmountDTO,
    type TransactionDTOExpanded,
    type TransactionDTOWithoutBookedAmounts,
    TransactionStatus
} from "@/generated";
import i18next from "i18next";
import {EntityList} from "@/components/entity/entity-list.tsx";
import {TransactionAPI, TransactionFunctions} from "@/views/payments/TransactionFunctions.ts";
import {TransactionFormExpanded} from "@/views/payments/TransactionForm.tsx";
import {renderAmount, renderDate} from "@/components/data-table.tsx";
import {type FunctionComponent, useState} from "react";
import {BookedAmountsDialog} from "@/views/payments/BookedAmountsDialog.tsx";
import {DropdownMenuItem} from "@/components/ui/dropdown-menu.tsx";
import {showError} from "@/lib/errors.tsx";
import {StatusToIcon} from "@/views/payments/TransactionItem.tsx";
import {PartnerFunctions} from "@/views/partner/PartnerFunctions.ts";
import {EntityDialog, EntityDialogState, type EntityFormProps} from "@/components/entity/entity-dialog.tsx";
import {BookedAmountForm} from "@/views/payments/BookedAmountForm.tsx";

export function deflate(dto: TransactionDTOExpanded): TransactionDTOWithoutBookedAmounts {
    return {
        ...dto,
        assetId: dto.asset?.id!,
        walletId: dto.wallet?.id!,
        partnerId: dto.partner?.id,
    }
}

export function TransactionView() {
    const columns: ColumnDef<TransactionDTOExpanded>[] = [
        {
            id: "name",
            accessorKey: "name",
            header: i18next.t("transaction.name"),
            enableSorting: true,
        },
        {
            id: "status",
            accessorKey: "status",
            header: i18next.t("transaction.status"),
            cell: ({row}) => (<span
                className={"flex gap-1.5 items-center"}>{StatusToIcon[row.original.status]} {i18next.t("TransactionStatus." + row.original.status)}</span>),
            enableSorting: true,
        },
        {
            id: "amount",
            accessorKey: "amount",
            header: i18next.t("transaction.amount"),
            cell: ({row}) => renderAmount(row.original.amount),
            enableSorting: true,
        },
        {
            id: "asset",
            accessorKey: "asset",
            header: i18next.t("transaction.asset"),
            cell: ({row}) => row.original.asset?.code,
            enableSorting: true,
        },
        {
            id: "date",
            accessorKey: "date",
            header: i18next.t("transaction.date"),
            cell: ({row}) => renderDate(row.original.date),
            enableSorting: true,
        },
        {
            id: "partner",
            accessorKey: "partner",
            header: i18next.t("transaction.partner"),
            cell: ({row}) => row.original.partner && PartnerFunctions.format(row.original.partner),
            enableSorting: true,
        },
        {
            id: "wallet",
            accessorKey: "wallet",
            header: i18next.t("transaction.wallet"),
            cell: ({row}) => row.original.wallet?.name,
            enableSorting: true,
        },
    ]

    const [bookedAmountStatus, setBookedAmountStatus] = useState<TransactionDTOExpanded | null>(null);
    const [baDialogOpen, setBaDialogOpen] = useState<boolean>(false);

    const [version, setVersion] = useState<number>(0);

    function updateStatus() {
        if (bookedAmountStatus?.id) {
            TransactionAPI.apiV2TransactionIdExpandGet({
                id: bookedAmountStatus.id
            }).then(res => {
                setBookedAmountStatus(res)
                setVersion(version + 1)
            }).catch(showError);
        }
    }


    const [entityDialogStatus, setEntityDialogStatus] = useState<EntityDialogState>(EntityDialogState.Closed);
    const bookedAmountForm: FunctionComponent<EntityFormProps<BookedAmountDTO>> = (props) => (
        <BookedAmountForm transaction={bookedAmountStatus!} {...props}/>
    )

    function complete() {
        if (bookedAmountStatus) {
            TransactionAPI.apiV2TransactionPatch({
                transactionDTOWithoutWorkspaceAndBookedAmounts: {
                    ...deflate(bookedAmountStatus),
                    status: TransactionStatus.Closed,
                }
            }).then(() => setVersion(version + 1)).catch(showError);
        }
    }

    return (
        <>
            <EntityDialog Form={bookedAmountForm}
                          state={entityDialogStatus}
                          setState={setEntityDialogStatus}
                          entity={null}
                          i18nKey={"booked"}
                          onSubmit={complete}/>
            {bookedAmountStatus && (
                <BookedAmountsDialog transaction={bookedAmountStatus}
                                     open={baDialogOpen}
                                     close={() => setBaDialogOpen(false)}
                                     update={updateStatus}/>
            )}
            <EntityList functions={TransactionFunctions}
                        columns={columns}
                        version={version}
                        additionalActions={({row}) => (
                            <>
                                <DropdownMenuItem onClick={() => {
                                    setBookedAmountStatus(row.original)
                                    setBaDialogOpen(true)
                                }}>
                                    {i18next.t("amounts.edit.title")}
                                </DropdownMenuItem>
                                {row.original.status === TransactionStatus.Open && (
                                    <DropdownMenuItem onClick={() => {
                                        setBookedAmountStatus(row.original)
                                        setEntityDialogStatus(EntityDialogState.Creating)
                                    }}>
                                        {i18next.t("transaction.complete")}
                                    </DropdownMenuItem>
                                )}
                            </>
                        )}
                        i18nKey={"transaction"}
                        Form={TransactionFormExpanded}/>
        </>
    )
}