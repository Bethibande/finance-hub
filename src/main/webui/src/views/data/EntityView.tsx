import type {ColumnDef} from "@tanstack/react-table";
import {useEffect, useRef, useState} from "react";
import i18next from "i18next";
import {Button} from "../../components/ui/button.tsx";
import {showHttpErrorAndContinue} from "../../lib/errors.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "../../components/ui/dropdown-menu.tsx";
import {MoreHorizontal} from "lucide-react";
import {DataTable, type PageQueryParams} from "../../components/table/data-table.tsx";
import {useViewConfig} from "../../lib/view-config.tsx";
import type {PagedResponse} from "../../lib/types.ts";
import {useWorkspace} from "../../lib/workspace.tsx";
import {
    type EntityActions,
    EntityDialog,
    type EntityDialogControls,
    type EntityEditForm,
    namespacedTranslations
} from "./EntityDialog.tsx";
import type {FieldValues} from "react-hook-form";
import {ArrowClockwise} from "react-bootstrap-icons";

export interface EntityViewProps<TEntity, TForm extends FieldValues> {
    actions: EntityActions<TEntity>,
    columns: ColumnDef<TEntity>[],
    editForm: EntityEditForm<TEntity, TForm>
}

export function EntityView<TEntity, TForm extends FieldValues>(props: EntityViewProps<TEntity, TForm>) {
    const {actions, editForm} = props
    const {i18nKey} = actions;

    const dialogControls = useRef<EntityDialogControls<TEntity>>(null)

    const columns: ColumnDef<TEntity>[] = [
        ...props.columns,
        {
            id: "actions",
            enablePinning: true,
            maxSize: 50,
            cell: ({row}) => {
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">{i18next.t("menu.open")}</span>
                                <MoreHorizontal className="h-4 w-4"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{i18next.t("menu.actions")}</DropdownMenuLabel>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem
                                onClick={() => dialogControls.current?.edit(row.original)}>{i18next.t("edit")}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => dialogControls.current?.delete(row.original)}
                                              variant={"destructive"}>{i18next.t("delete")}</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        }
    ]

    const {workspace} = useWorkspace()

    const [version, setVersion] = useState(0)
    const [lastQuery, setLastQuery] = useState<PageQueryParams | null>(null)
    const [data, setData] = useState<PagedResponse<TEntity>>({
        page: 0,
        size: 0,
        totalPages: 0,
        totalElements: 0,
        data: []
    })
    useEffect(reload, [version, workspace])

    function reload() {
        if (lastQuery) {
            loadPage(lastQuery)
        }
    }

    function loadPage(query: PageQueryParams) {
        actions.load(workspace, query).then(showHttpErrorAndContinue).then(res => {
            if (res.ok) {
                res.json().then(setData)
                setLastQuery(query)
            }
        })
    }

    const {setViewConfig} = useViewConfig()
    useEffect(() => {
        setViewConfig({
            toolbar: (<h2>{i18next.t("views." + i18nKey + ".title")}</h2>)
        })
    }, []);

    const dialogTranslations = namespacedTranslations(i18nKey)

    return (
        <div className={"w-full h-full flex flex-col items-center gap-6"}>
            {<EntityDialog form={editForm}
                           translations={dialogTranslations}
                           actions={actions}
                           onChange={() => setVersion(version + 1)}
                           ref={dialogControls}/>}

            <div className={"w-full lg:w-2/3 px-4"}>
                <div className={"pb-2 flex items-center justify-between gap-2"}>
                    <Button onClick={() => {
                        dialogControls.current?.edit(undefined)
                    }}>+ {i18next.t("create")}</Button>
                    <Button variant={"outline"} onClick={reload}><ArrowClockwise/></Button>
                </div>
                <DataTable columns={columns}
                           defaultSorting={[{id: columns[0].id!, desc: false}]}
                           pinned={["actions"]}
                           page={data}
                           pageSize={15}
                           changePage={loadPage}/>
            </div>
        </div>
    )
}