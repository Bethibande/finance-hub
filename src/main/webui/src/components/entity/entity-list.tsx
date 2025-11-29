import {type DataQuery, DataTable, type TableData} from "@/components/data-table.tsx";
import type {ColumnDef} from "@tanstack/react-table";
import {useEffect, useState} from "react";
import {useViewConfig} from "@/lib/view-config.tsx";
import i18next from "i18next";
import {Button} from "@/components/ui/button.tsx";
import {ArrowClockwise} from "react-bootstrap-icons";
import {showError} from "@/lib/errors.tsx";

export interface EntityListProps<TEntity> {
    load: (query: DataQuery) => Promise<TableData<TEntity>>,
    columns: ColumnDef<TEntity>[],
    i18nKey: string,
    updateViewConfig?: boolean
}

export function EntityList<TEntity>(props: EntityListProps<TEntity>) {
    const {load, columns, i18nKey, updateViewConfig} = props;
    
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

    return (
        <div className={"flex justify-center w-full"}>
            <div className={"flex flex-col gap-2 lg:w-2/3 w-full"}>
                <div className={"flex justify-between items-center"}>
                    <div>
                        <Button>+ {i18next.t("add")}</Button>
                    </div>
                    <div>
                        <Button variant={"outline"} size={"icon"}><ArrowClockwise/></Button>
                    </div>
                </div>
                <DataTable pagination={true}
                           data={data}
                           columns={columns}
                           update={update}
                           pinned={["actions"]}/>
            </div>
        </div>
    )
}