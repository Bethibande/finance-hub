import {
    type Column,
    type ColumnDef,
    type ColumnSort,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    type Header,
    type SortingState,
    useReactTable
} from "@tanstack/react-table";
import {Direction, type SortOrder} from "@/lib/types.ts";
import {type CSSProperties, useEffect, useState} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {cn} from "@/lib/utils.ts";
import {Button} from "@/components/ui/button.tsx";
import i18next from "i18next";
import {ArrowsVertical, SortDown, SortUp} from "react-bootstrap-icons";

export interface DataQuery {
    sort: SortOrder[],
    page: number,
}

export interface TableData<TData> {
    data: TData[],
    page: number,
    total: number,
}

export interface DataTableProps<TData> {
    pagination: boolean,
    data: TableData<TData>,
    columns: ColumnDef<TData>[],
    update: (query: DataQuery) => void,
    pinned?: string[],
    defaultSortOrder?: SortOrder[],
}

export function renderAmount(amount: number) {
    return (
        <p className={cn("text-right", amount < 0.0 && "text-red-600")}>{amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}</p>
    )
}

export function renderDate(value: string) {
    const date = new Date(value);
    return (
        <p>{date.toLocaleDateString()}</p>
    )
}

const getCommonPinningStyles = (column: Column<any>): CSSProperties => {
    const isPinned = column.getIsPinned()
    return {
        left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
        right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
        position: isPinned ? 'sticky' : 'relative',
        width: column.getSize(),
        zIndex: isPinned ? 1 : 0,
    }
}

function toSortState(sortOrder: SortOrder[]): ColumnSort[] {
    return sortOrder.map(order => ({id: order.field, desc: order.direction === Direction.Descending}))
}

function toSortOrder(state: SortingState): SortOrder[] {
    return state.map(col => ({field: col.id, direction: col.desc ? Direction.Descending : Direction.Ascending}))
}

function renderHeader<TData>(header: Header<TData, any>) {
    function toggleSort(e: React.MouseEvent<HTMLButtonElement>) {
        const sorted = header.column.getIsSorted();
        if (sorted === "asc") {
            header.column.clearSorting();
        } else if (sorted === "desc") {
            header.column.toggleSorting(false, e.shiftKey);
        } else {
            header.column.toggleSorting(true, e.shiftKey);
        }
    }

    const icon = header.column.getIsSorted() === false
        ? <ArrowsVertical/>
        : header.column.getIsSorted() === "asc" ? <SortUp/> : <SortDown/>;

    if (!header.column.getCanSort()) {
        return flexRender(
            header.column.columnDef.header,
            header.getContext()
        )
    } else {
        return (
            <div className={"flex gap-2 items-center"}>
                {
                    flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                    )
                }

                <Button onClick={toggleSort} variant={"ghost"}>
                    {icon}
                </Button>
            </div>
        )
    }
}

export function DataTable<TData>(props: DataTableProps<TData>) {
    const {columns, data, pagination, update, pinned} = props

    const [sorting, setSorting] = useState<SortingState>(props.defaultSortOrder ? toSortState(props.defaultSortOrder) : [{
        id: columns[0].id!,
        desc: false
    }]);

    useEffect(() => {
        changePage(data.page, sorting)
    }, [sorting]);

    const table = useReactTable({
        data: data.data,
        columns,
        manualSorting: true,
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        getCoreRowModel: getCoreRowModel(),
        state: {
            sorting,
            columnPinning: {
                right: pinned
            }
        }
    })

    function changePage(page: number, sorting: SortingState) {
        update({
            sort: toSortOrder(sorting),
            page
        })
    }

    return (
        <div className={"flex flex-col gap-2"}>
            <div className="overflow-hidden rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : renderHeader(header)}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        const column = cell.column
                                        return (
                                            <TableCell key={cell.id} style={{...getCommonPinningStyles(column)}}
                                                       className={cn(column.getIsPinned() && "bg-white")}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

            </div>
            {(pagination === undefined || pagination) && (
                <div className={"flex justify-between items-center"}>
                    <div className={"font-medium p-2 w-fit"}>
                        {data.total.toLocaleString()} {i18next.t("table.rows")}
                    </div>
                    <div className={"flex gap-1"}>
                        <Button onClick={() => changePage(data.page - 1, sorting)}
                                variant={"outline"}
                                disabled={data.page <= 0}>
                            {i18next.t("table.previous")}
                        </Button>
                        <Button onClick={() => changePage(data.page + 1, sorting)}
                                variant={"outline"}
                                disabled={data.page + 1 >= Math.ceil(data.total / data.data.length)}>
                            {i18next.t("table.next")}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
