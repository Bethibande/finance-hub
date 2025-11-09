import type {ColumnDef} from "@tanstack/react-table";
import * as React from "react";
import {useEffect, useState} from "react";
import i18next from "i18next";
import {Button} from "../../components/ui/button.tsx";
import {showError, showHttpError} from "../../lib/errors.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "../../components/ui/dropdown-menu.tsx";
import {MoreHorizontal} from "lucide-react";
import {DataTable} from "../../components/table/data-table.tsx";
import {useViewConfig} from "../../lib/view-config.tsx";
import type {PagedResponse} from "../../lib/types.ts";

export interface EntityActions<TEntity> {
    load: () => Promise<Response>,
    create: (entity: TEntity) => Promise<any>,
    save: (entity: TEntity) => Promise<any>,
    delete: (entity: TEntity) => Promise<any>
}

export const EntityDialogState = {
    CLOSED: "CLOSED",
    EDITING: "EDITING",
    DELETING: "DELETING",
} as const

export type EntityDialogState = typeof EntityDialogState[keyof typeof EntityDialogState]

export interface EntityEditDialogProps<TEntity> {
    entity: TEntity | null,
    state: EntityDialogState,
    close: () => void,
    actions: EntityActions<TEntity>
}

export interface EntityViewProps<TEntity> {
    actions: EntityActions<TEntity>,
    columns: ColumnDef<TEntity>[],
    i18nKey: string,
    editDialog: (props: EntityEditDialogProps<TEntity>) => React.JSX.Element
}

interface ViewState<TEntity> {
    editing: EntityDialogState,
    entity: TEntity | null,
}

export function EntityView<TEntity>(props: EntityViewProps<TEntity>) {
    const [state, setState] = useState<ViewState<TEntity>>({editing: EntityDialogState.CLOSED, entity: null})

    function edit(entity: TEntity | null) {
        setState({editing: EntityDialogState.EDITING, entity: entity})
    }

    function deleteEntity(entity: TEntity) {
        setState({editing: EntityDialogState.DELETING, entity: entity})
    }

    const {actions, editDialog, i18nKey} = props
    const columns: ColumnDef<TEntity>[] = [
        ...props.columns,
        {
            id: "actions",
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
                            <DropdownMenuItem onClick={() => edit(row.original)}>{i18next.t("edit")}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteEntity(row.original)}
                                              variant={"destructive"}>{i18next.t("delete")}</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        }
    ]

    const [version, setVersion] = useState(0)
    const [data, setData] = useState<PagedResponse<TEntity>>({page: 0, size: 0, pages: 0, totalElements: 0, data:[]})
    useEffect(() => {
        actions.load()
            .then(response => {
                if (!response.ok) {
                    showHttpError(response)
                    return;
                }
                response.json().then(setData)
            })
            .catch(showError)
    }, [version])

    function handleCrudResponse(response: Response) {
        if (!response.ok) {
            showHttpError(response)
            return;
        }
        setVersion(version + 1)
    }

    function wrapEntityAction(action: (entity: TEntity) => Promise<any>) {
        return (entity: TEntity) => action(entity).then(handleCrudResponse).catch(showError)
    }

    const editDialogProps: EntityEditDialogProps<TEntity> = {
        entity: state.entity,
        state: state.editing,
        close: () => setState({...state, editing: EntityDialogState.CLOSED}),
        actions: {
            create: wrapEntityAction(actions.create),
            delete: wrapEntityAction(actions.delete),
            save: wrapEntityAction(actions.save),
            load: actions.load
        }
    }

    const {setViewConfig} = useViewConfig()
    useEffect(() => {
        setViewConfig({
            toolbar: (<h2>{i18next.t("views." + i18nKey + ".title")}</h2>)
        })
    }, []);

    return (
        <div className={"w-full h-full flex flex-col items-center gap-6"}>
            {editDialog(editDialogProps)}

            <div className={"w-full lg:w-1/2 px-4"}>
                <div className={"pb-2 flex items-center justify-between gap-2"}>
                    <Button onClick={() => {
                        edit(null)
                    }}>+ {i18next.t("create")}</Button>
                </div>
                <DataTable columns={columns} data={data.data}/>
            </div>
        </div>
    )
}