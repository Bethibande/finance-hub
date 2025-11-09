import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
} from "@tanstack/react-table"
import {type Table as TTable} from "@tanstack/table-core"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "./../ui/table.tsx";
import {type RefObject, useEffect, useState} from "react";
import type {PagedResponse} from "../../lib/types.ts";
import {Button} from "../ui/button.tsx";
import i18next from "i18next";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    page: PagedResponse<TData>,
    changePage: (page: number) => void,
    ref?: RefObject<TTable<TData> | null>
}

export function DataTable<TData, TValue>({
                                             columns,
                                             page,
                                             changePage,
                                             ref
                                         }: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [rowSelection, setRowSelection] = useState({})

    const data = page.data

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
            rowSelection: rowSelection,
        }
    })

    useEffect(() => {
        if (ref) {
            ref.current = table
        }
    }, [])

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
                                    onClick={() => row.toggleSelected()}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
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
            <div className={"flex justify-between items-center"}>
                <div className={"font-medium p-2 w-fit"}>
                    {page.totalElements.toLocaleString()} {i18next.t("table.rows")}
                </div>
                <div className={"flex gap-1"}>
                    <Button onClick={() => changePage(page.page - 1)}
                            variant={"outline"}
                            disabled={page.page <= 0}>
                        {i18next.t("table.previous")}
                    </Button>
                    <Button onClick={() => changePage(page.page + 1)}
                            variant={"outline"}
                            disabled={page.page + 1 >= page.totalPages}>
                        {i18next.t("table.next")}
                    </Button>
                </div>
            </div>
        </div>
    )
}