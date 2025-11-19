import type {BookedAmount, PagedResponse, Transaction} from "../../lib/types.ts";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "../../components/ui/dialog.tsx";
import {DialogDescription} from "@radix-ui/react-dialog";
import {Button} from "../../components/ui/button.tsx";
import {DataTable} from "../../components/table/data-table.tsx";
import type {ColumnDef} from "@tanstack/react-table";
import {TransactionItem} from "./Payments.tsx";

export interface BookingDialogProps {
    transaction: Transaction,
    open: boolean,
    setOpen: (open: boolean) => void,
    onChange: () => void,
}

export function BookingDialog(props: BookingDialogProps) {
    const {transaction, open, setOpen} = props;

    const columns: ColumnDef<BookedAmount>[] = [

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
                        Edit Bookings
                    </DialogTitle>
                    <DialogDescription>
                        Edit bookings for transaction '{transaction.name}'
                    </DialogDescription>
                </DialogHeader>
                <div className={"flex flex-col gap-3"}>
                    <TransactionItem transaction={transaction}/>
                    <Button>+ Create</Button>
                    <DataTable columns={columns} page={data} changePage={() => {}}/>
                </div>
            </DialogContent>
        </Dialog>
    )
}