import type {TransactionDTOExpanded} from "@/generated";
import {Item, ItemContent, ItemDescription, ItemMedia, ItemTitle} from "@/components/ui/item.tsx";
import {renderAmount} from "@/components/data-table.tsx";
import {AssetFunctions} from "@/views/asset/AssetView.tsx";
import {WalletFunctions} from "@/views/wallet/WalletFunctions.ts";
import {Archive, Clipboard, ClipboardCheck} from "react-bootstrap-icons";

export interface TransactionItemProps {
    transaction: TransactionDTOExpanded
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
                        className={"flex gap-1 text-primary"}>{renderAmount(transaction.amount)} {AssetFunctions.format(transaction.asset!)}</span>
                </ItemDescription>
            </ItemContent>
            <ItemContent>
                <ItemDescription>
                    <p className={"text-right"}>
                        {WalletFunctions.format(transaction.wallet!)}
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