import {type DataQuery, DataTable, type TableData} from "@/components/data-table.tsx";
import type {ColumnDef} from "@tanstack/react-table";
import {type FunctionComponent, useEffect, useState} from "react";
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

export interface EntityListProps<TEntity> {
    load: (query: DataQuery) => Promise<TableData<TEntity>>,
    columns: ColumnDef<TEntity>[],
    i18nKey: string,
    updateViewConfig?: boolean,
    Form: FunctionComponent<EntityFormProps<TEntity>>,
}

export function EntityList<TEntity>(props: EntityListProps<TEntity>) {
    const {load, columns, i18nKey, Form, updateViewConfig} = props;
    
    const [data, setData] = useState<TableData<TEntity>>({
        data: [],
        page: 0,
        total: 0,
    });

    if (updateViewConfig === undefined || updateViewConfig) {
        const {setViewConfig} = useViewConfig();
        useEffect(() => {
            setViewConfig({
                toolbar: (<h2>{i18next.t(i18nKey + ".title")}</h2>)
            })
        }, [])
    }

    function update(query: DataQuery) {
        load(query)
            .then(setData)
            .catch(showError)
    }

    const [dialogState, setDialogState] = useState<EntityDialogState>(EntityDialogState.Closed)
    const [editingEntity, setEditingEntity] = useState<TEntity | null>(null)

    const actualColumns: ColumnDef<TEntity>[] = [
        ...columns,
        {
            id: "actions",
            cell: ({row}) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={"secondary"} size={"icon"}><ThreeDots/></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => {
                            setEditingEntity(row.original)
                            setDialogState(EntityDialogState.Editing)
                        }}>{i18next.t("edit")}</DropdownMenuItem>
                        <DropdownMenuItem variant={"destructive"}>{i18next.t("delete")}</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
            maxSize: 36,
        }
    ]

    return (
        <>
            <EntityDialog Form={Form}
                          state={dialogState}
                          setState={setDialogState}
                          entity={editingEntity}
                          i18nKey={i18nKey}/>

            <div className={"flex justify-center w-full"}>
                <div className={"flex flex-col gap-2 lg:w-2/3 w-full"}>
                    <div className={"flex justify-between items-center"}>
                        <div>
                            <Button onClick={() => {
                                setEditingEntity(null)
                                setDialogState(EntityDialogState.Creating)
                            }}>+ {i18next.t("add")}</Button>
                        </div>
                        <div>
                            <Button variant={"outline"} size={"icon"}><ArrowClockwise/></Button>
                        </div>
                    </div>
                    <DataTable pagination={true}
                               data={data}
                               columns={actualColumns}
                               update={update}
                               pinned={["actions"]}/>
                </div>
            </div>
        </>
    )
}