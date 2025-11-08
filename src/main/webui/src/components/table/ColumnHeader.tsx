import {Button} from "../ui/button.tsx";
import type {Column} from "@tanstack/react-table";
import {ArrowsVertical, SortDown, SortUp} from "react-bootstrap-icons";
import * as React from "react";
import {type ReactNode} from "react";

export default function ColumnHeader<TData>(props: { column: Column<TData>, header: ReactNode }) {
    const {column, header} = props;

    function toggleSort(e: React.MouseEvent<HTMLButtonElement>) {
        const sorted = column.getIsSorted();
        if (sorted === "asc") {
            column.toggleSorting(true, e.shiftKey);
        } else if (sorted === "desc") {
            column.clearSorting();
        } else {
            column.toggleSorting(false, e.shiftKey);
        }
    }

    const icon = column.getIsSorted() === false ? <ArrowsVertical/> : column.getIsSorted() === "asc" ? <SortUp/> : <SortDown/>;

    return (
        <div className={"w-full flex gap-2 items-center"}>
            {header}
            <Button variant="ghost" onClick={toggleSort}>
                {icon}
            </Button>
        </div>
    )
}