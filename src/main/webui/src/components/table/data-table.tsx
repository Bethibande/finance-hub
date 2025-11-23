import {
    type Column,
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
} from "@tanstack/react-table"
import {type Table as TTable} from "@tanstack/table-core"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "./../ui/table.tsx";
import {type CSSProperties, type RefObject, useEffect, useState} from "react";
import {type CRUDSortOrder, Direction, type PagedResponse} from "../../lib/types.ts";
import {Button} from "../ui/button.tsx";
import i18next from "i18next";
import {cn} from "../../lib/utils.ts";

export interface PageQueryParams {
    page: number;
    size: number;
    sort: CRUDSortOrder[];
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    pagination?: boolean,
    page: PagedResponse<TData>,
    pageSize: number,
    changePage: (query: PageQueryParams) => void,
    ref?: RefObject<TTable<TData> | null>,
    defaultSorting?: SortingState,
    pinned?: string[],
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

function toPageQuery(page: number, size: number, sorting: SortingState): PageQueryParams {
    return {
        page: page,
        size: size,
        sort: sorting.map(sort => {
            return {
                field: sort.id,
                direction: sort.desc ? Direction.Descending : Direction.Ascending
            } satisfies CRUDSortOrder
        })
    }
}

export function DataTable<TData, TValue>({
                                             columns,
                                             pagination,
                                             page,
                                             pageSize,
                                             changePage,
                                             ref,
                                             defaultSorting,
                                             pinned,
                                         }: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>(defaultSorting || [])
    const [rowSelection, setRowSelection] = useState({})

    const data = page.data

    const table = useReactTable({
        data,
        columns,
        manualSorting: true,
        getCoreRowModel: getCoreRowModel(),
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
            columnPinning: {
                right: pinned
            },
            rowSelection: rowSelection,
        }
    })

    useEffect(() => {
        if (ref) {
            ref.current = table
        }
    }, [])

    useEffect(() => {
        changePage(toPageQuery(page.page, pageSize, sorting))
    }, [sorting]);

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
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
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
                        {page.totalElements.toLocaleString()} {i18next.t("table.rows")}
                    </div>
                    <div className={"flex gap-1"}>
                        <Button onClick={() => changePage(toPageQuery(page.page - 1, pageSize, sorting))}
                                variant={"outline"}
                                disabled={page.page <= 0}>
                            {i18next.t("table.previous")}
                        </Button>
                        <Button onClick={() => changePage(toPageQuery(page.page + 1, pageSize, sorting))}
                                variant={"outline"}
                                disabled={page.page + 1 >= page.totalPages}>
                            {i18next.t("table.next")}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}