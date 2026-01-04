import {type DataQuery, DataTable, type TableData} from "@/components/data-table.tsx";
import type {CellContext, ColumnDef} from "@tanstack/react-table";
import {type FunctionComponent, type ReactNode, useEffect, useRef, useState} from "react";
import {useViewConfig} from "@/lib/view-config.tsx";
import i18next from "i18next";
import {Button} from "@/components/ui/button.tsx";
import {ArrowClockwise, ThreeDots} from "react-bootstrap-icons";
import {showError} from "@/lib/errors.tsx";
import {EntityDialog, EntityDialogState, type EntityFormProps} from "@/components/entity/entity-dialog.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import type {EntityFunctions} from "@/components/entity/entity-functions.ts";
import {EntityDeleteDialog} from "@/components/entity/entity-delete-dialog.tsx";
import type {SortOrder} from "@/lib/types.ts";

export interface EntityListProps<TEntity, TID> {
    functions: EntityFunctions<TEntity, TID>,
    columns: ColumnDef<TEntity>[],
    i18nKey: string,
    updateViewConfig?: boolean,
    Form?: FunctionComponent<EntityFormProps<TEntity>>,
    additionalActions?: (ctx: CellContext<TEntity, unknown>) => ReactNode,
    version?: number,
    defaultSort?: SortOrder[]
}

export function EntityList<TEntity, TID>(props: EntityListProps<TEntity, TID>) {
    const {functions, columns, i18nKey, Form, additionalActions, updateViewConfig, defaultSort} = props;

    const [version, setVersion] = useState<number>(0)
    const [data, setData] = useState<TableData<TEntity>>({
        data: [],
        page: 0,
        pages: 0,
        total: 0,
    });

    if (updateViewConfig === undefined || updateViewConfig) {
        const {setViewConfig} = useViewConfig();
        useEffect(() => {
            setViewConfig({
                toolbar: (<h2>{i18next.t(i18nKey + ".title")}</h2>)
            })
        }, [i18nKey, setViewConfig])
    }

    useEffect(() => {
        if (props.version && props.version !== 0 && prevQueryRef.current) {
            update(prevQueryRef.current)
        }
    }, [props.version]);

    const prevQueryRef = useRef<DataQuery>(null)

    function update(query: DataQuery) {
        prevQueryRef.current = query;
        functions.list(query)
            .then(page => setData({
                page: page.page,
                pages: page.totalPages,
                total: page.totalElements,
                data: page.data,
            }))
            .catch(showError)
    }

    const [dialogState, setDialogState] = useState<EntityDialogState>(EntityDialogState.Closed)
    const [editingEntity, setEditingEntity] = useState<TEntity | null>(null)

    const actualColumns: ColumnDef<TEntity>[] = [
        ...columns,
        {
            id: "actions",
            cell: (ctx) => (
                <div className={"w-full flex justify-end"}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant={"secondary"} size={"icon"}><ThreeDots/></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {Form && (
                                <DropdownMenuItem onClick={() => {
                                    setEditingEntity(ctx.row.original)
                                    setDialogState(EntityDialogState.Editing)
                                }}>{i18next.t("edit")}
                                </DropdownMenuItem>
                            )}

                            {additionalActions && additionalActions(ctx)}

                            {Form && (
                                <DropdownMenuItem onClick={() => {
                                    setEditingEntity(ctx.row.original)
                                    setDialogState(EntityDialogState.Closed)
                                    setDeleteDialogOpen(true)
                                }} variant={"destructive"}>{i18next.t("delete")}
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
            maxSize: 36,
        }
    ]

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    function onDelete() {
        if (editingEntity) {
            functions.delete(functions.toId(editingEntity)).then(() => {
                setEditingEntity(null)
                setDeleteDialogOpen(false)
                setVersion(version + 1)
            }).catch(showError)
        }
    }

    return (
        <>
            <EntityDeleteDialog open={deleteDialogOpen}
                                close={() => setDeleteDialogOpen(false)}
                                display={editingEntity ? functions.format(editingEntity) : ""}
                                onDelete={onDelete}/>
            {Form && (
                <EntityDialog Form={Form}
                              state={dialogState}
                              setState={setDialogState}
                              entity={editingEntity}
                              i18nKey={i18nKey}
                              onSubmit={() => setVersion(version + 1)}/>
            )}

            <div className={"flex justify-center w-full"}>
                <div className={"flex flex-col gap-2 lg:w-2/3 w-full"}>
                    <div className={"flex justify-between items-center"}>
                        <div>
                            {Form && (
                                <Button onClick={() => {
                                    setEditingEntity(null)
                                    setDialogState(EntityDialogState.Creating)
                                }}>+ {i18next.t("add")}</Button>
                            )}
                        </div>
                        <div>
                            <Button variant={"outline"} size={"icon"}
                                    onClick={() => setVersion(version + 1)}><ArrowClockwise/></Button>
                        </div>
                    </div>
                    <DataTable pagination={true}
                               version={version}
                               data={data}
                               defaultSortOrder={defaultSort}
                               columns={actualColumns}
                               update={update}
                               pinned={["actions"]}/>
                </div>
            </div>
        </>
    )
}