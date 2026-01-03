import {type BookedAmountDTO, type TransactionDTOExpanded, TransactionStatus} from "@/generated";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import i18next from "i18next";
import {StatusToIcon, TransactionItem} from "@/views/payments/TransactionItem.tsx";
import {createBookedAmountFunctions} from "@/views/payments/BookedAmountFunctions.ts";
import type {ColumnDef} from "@tanstack/react-table";
import {type DataQuery, DataTable, renderAmount, renderDate, type TableData} from "@/components/data-table.tsx";
import {AssetFunctions} from "@/views/asset/AssetView.tsx";
import {WalletFunctions} from "@/views/wallet/WalletFunctions.ts";
import {BookedAmountForm} from "@/views/payments/BookedAmountForm.tsx";
import {type FunctionComponent, type ReactNode, useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {EntityDialog, EntityDialogState, type EntityFormProps} from "@/components/entity/entity-dialog.tsx";
import {showError} from "@/lib/errors.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {ThreeDots} from "react-bootstrap-icons";
import {EntityDeleteDialog} from "@/components/entity/entity-delete-dialog.tsx";
import {TransactionAPI} from "@/views/payments/TransactionFunctions.ts";

export interface BookedAmountsDialogProps {
    transaction: TransactionDTOExpanded,
    open: boolean,
    close: () => void,
    update: () => void,
}

export function BookedAmountsDialog(props: BookedAmountsDialogProps) {
    const {transaction, open, close, update} = props

    const columns: ColumnDef<BookedAmountDTO>[] = [
        {
            id: "date",
            accessorKey: "date",
            header: i18next.t("booked.date"),
            cell: ({row}) => renderDate(row.original.date!),
            enableSorting: true,
        },
        {
            id: "amount",
            accessorKey: "amount",
            header: i18next.t("booked.amount"),
            cell: ({row}) => renderAmount(row.original.amount!),
            enableSorting: true,
        },
        {
            id: "asset",
            accessorKey: "asset",
            header: i18next.t("booked.asset"),
            cell: ({row}) => AssetFunctions.format(row.original.asset!),
            enableSorting: true,
        },
        {
            id: "wallet",
            accessorKey: "wallet",
            header: i18next.t("booked.wallet"),
            cell: ({row}) => WalletFunctions.format(row.original.wallet!),
            enableSorting: true,
        },
        {
            id: "actions",
            cell: ({row}) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={"secondary"}><ThreeDots/></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => {
                            setEditDialogEntity(row.original)
                            setEditDialogState(EntityDialogState.Editing)
                        }}>{i18next.t("edit")}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                            setEditDialogEntity(row.original)
                            setDeleteDialogOpen(true)
                        }} variant={"destructive"}>{i18next.t("delete")}</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    function changeTransactionStatus(status: TransactionStatus) {
        TransactionAPI.apiV2TransactionPut({
            transactionDTOWithoutWorkspaceAndBookedAmounts: {
                ...transaction,
                assetId: transaction.asset!.id!,
                partnerId: transaction.partner?.id,
                walletId: transaction.wallet!.id!,
                status
            }
        }).then(update).catch(showError);
    }

    const toolbar: ReactNode = (
        <div className={"flex gap-2 mt-2 mb-1 w-full"}>
            {transaction.status === TransactionStatus.Open && (
                <>
                    <Button className={"grow-2"} onClick={() => {
                        setEditDialogState(EntityDialogState.Creating)
                        setEditDialogEntity(null)
                    }}>+ Book amount</Button>
                    <Button className={"grow-1"}
                            onClick={() => changeTransactionStatus(TransactionStatus.Cancelled)}
                            variant={"secondary"}>{StatusToIcon[TransactionStatus.Cancelled]} Cancel</Button>
                    <Button className={"grow-1"}
                            onClick={() => changeTransactionStatus(TransactionStatus.Closed)}
                            variant={"secondary"}>{StatusToIcon[TransactionStatus.Closed]} Complete</Button>
                </>
            )}
            {transaction.status !== TransactionStatus.Open && (
                <>
                    <Button className={"grow-1"}
                            onClick={() => changeTransactionStatus(TransactionStatus.Open)}
                            variant={"secondary"}>{StatusToIcon[TransactionStatus.Open]} Re-Open transaction</Button>
                </>
            )}
        </div>
    )

    const [editDialogState, setEditDialogState] = useState<EntityDialogState>(EntityDialogState.Closed);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogEntity, setEditDialogEntity] = useState<BookedAmountDTO | null>(null);

    const [version, setVersion] = useState<number>(0);

    const form: FunctionComponent<EntityFormProps<BookedAmountDTO>> = (props) => (
        <BookedAmountForm {...props} transaction={transaction}/>)

    const [data, setData] = useState<TableData<BookedAmountDTO>>({
        data: [],
        page: 0,
        total: 0
    })

    const functions = createBookedAmountFunctions(transaction.id!);
    function updateTable(query: DataQuery) {
        functions
            .list(query)
            .then(res => setData({data: res.data, page: res.page, total: res.totalElements}))
            .catch(showError);
    }

    function confirmDelete() {
        if (editDialogEntity?.id) {
            functions.delete(editDialogEntity.id)
                .then(() => setVersion(version + 1))
                .catch(showError);

            setDeleteDialogOpen(false)
            setEditDialogEntity(null)
        }
    }

    return (
        <>
            <EntityDeleteDialog open={deleteDialogOpen}
                                close={() => setDeleteDialogOpen(false)}
                                display={editDialogEntity ? functions.format(editDialogEntity) : ""}
                                onDelete={confirmDelete}/>
            <EntityDialog Form={form}
                          state={editDialogState}
                          setState={setEditDialogState}
                          entity={editDialogEntity}
                          i18nKey={"booked"}
                          onSubmit={() => setVersion(version + 1)}/>
            <Dialog open={open} onOpenChange={close}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{i18next.t("amounts.edit.title")}</DialogTitle>
                    </DialogHeader>
                    <div className={"flex flex-col gap-2 w-full overflow-hidden"}>
                        <TransactionItem transaction={transaction}/>
                        {toolbar}
                        <DataTable pagination={true}
                                   data={data}
                                   version={version}
                                   columns={columns}
                                   update={updateTable}
                                   pinned={["actions"]}/>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}