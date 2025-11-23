import {type BookedAmount, type PagedResponse, type Transaction, TransactionStatus} from "@/lib/types.ts";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "../../components/ui/dialog.tsx";
import {Button} from "../../components/ui/button.tsx";
import {DataTable} from "../../components/table/data-table.tsx";
import type {ColumnDef} from "@tanstack/react-table";
import {StatusToIcon, TransactionItem} from "./Payments.tsx";
import {columnHeader} from "@/components/ui/table.tsx";
import i18next from "i18next";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";

export interface BookingDialogProps {
    transaction: Transaction,
    open: boolean,
    setOpen: (open: boolean) => void,
    onChange: () => void,
}

export function BookingDialog(props: BookingDialogProps) {
    const {transaction, open, setOpen} = props;

    const columns: ColumnDef<BookedAmount>[] = [
        {
            id: "date",
            header: columnHeader(i18next.t("bookedAmount.date")),
            enableSorting: true,
            accessorKey: "date",
        },
        {
            id: "amount",
            header: columnHeader(i18next.t("bookedAmount.amount")),
            enableSorting: true,
            accessorKey: "amount",
        },
        {
            id: "asset",
            header: i18next.t("bookedAmount.asset"),
            accessorKey: "asset",
        },
        {
            id: "wallet",
            header: columnHeader(i18next.t("bookedAmount.wallet")),
            enableSorting: true,
            accessorKey: "wallet",
        }
    ]

    const data: PagedResponse<BookedAmount> = {
        data: transaction.bookedAmounts,
        page: 0,
        totalPages: 0,
        size: transaction.bookedAmounts.length,
        totalElements: transaction.bookedAmounts.length,
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Edit booked amounts {/* TODO: i18n */}
                    </DialogTitle>
                </DialogHeader>
                <div
                    className={"flex flex-col gap-3 w-full overflow-hidden"}> { /* overflow-hidden somehow enforces a max width */}
                    <TransactionItem transaction={transaction}/>
                    <div className={"flex gap-3"}>
                        {transaction.status === TransactionStatus.OPEN && (
                            <>
                                <Button className={"grow"}>+ Book amount</Button> {/* TODO: i18n */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button className={"grow"} variant={"secondary"}>{StatusToIcon[TransactionStatus.CANCELLED]} Cancel {/* TODO: i18n */}</Button>
                                    </TooltipTrigger>
                                    <TooltipContent> {/* TODO: i18n */}
                                        Mark the transaction as cancelled
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button className={"grow"} variant={"secondary"}>{StatusToIcon[TransactionStatus.CLOSED]} Complete {/* TODO: i18n */}</Button>
                                    </TooltipTrigger>
                                    <TooltipContent> {/* TODO: i18n */}
                                        Mark the transaction as completed
                                    </TooltipContent>
                                </Tooltip>
                            </>
                        )}
                        {transaction.status !== TransactionStatus.OPEN && (
                            <Button className={"grow"} variant={"secondary"}>{StatusToIcon[TransactionStatus.OPEN]} Reopen transaction {/* TODO: i18n */}</Button>
                        )}
                    </div>
                    <DataTable columns={columns}
                               pagination={false}
                               pageSize={15}
                               page={data}
                               changePage={() => {
                               }}/>
                </div>
                <DialogFooter>
                    <Button onClick={() => setOpen(false)} variant={"ghost"}>Close {/* TODO: i18n */}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}