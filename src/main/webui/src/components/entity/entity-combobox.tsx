import type {PagedResponse} from "@/lib/types.ts";
import {ComboBox} from "@/components/combobox.tsx";
import {useEffect, useState} from "react";
import {useWorkspace} from "@/lib/workspace.tsx";
import {showError} from "@/lib/errors.tsx";
import type {EntityListFunctions} from "@/components/entity/entity-functions.ts";

export interface EntityComboBoxProps<TEntity, TID> {
    value: TID | null,
    onChange: (value: TID | null) => void,
    functions: EntityListFunctions<TEntity, TID>
    optional: boolean,
    emptyLabel?: string,
}

export function EntityComboBox<TEntity, TID>(props: EntityComboBoxProps<TEntity, TID>) {
    const {value, onChange, functions, optional, emptyLabel} = props;

    const [options, setOptions] = useState<PagedResponse<TEntity>>({
        data: [],
        page: 0,
        pageSize: 0,
        totalElements: 0,
        totalPages: 0
    })

    const {workspace} = useWorkspace();
    useEffect(() => {
        functions.list({
            sort: [],
            page: 0,
            workspace: workspace,
        }).then(setOptions).catch(showError);
    }, [workspace]);

    return (
        <ComboBox value={value}
                  options={options.data}
                  toValue={functions.toId}
                  toStringValue={functions.format}
                  onChange={onChange}
                  emptyLabel={emptyLabel}
                  optional={optional}/>
    )
}