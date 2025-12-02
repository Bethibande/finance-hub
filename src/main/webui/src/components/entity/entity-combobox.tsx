import type {PagedResponse} from "@/lib/types.ts";
import {ComboBox} from "@/components/combobox.tsx";
import {type FunctionComponent, useEffect, useState} from "react";
import {useWorkspace} from "@/lib/workspace.tsx";
import {showError} from "@/lib/errors.tsx";
import type {EntityListFunctions} from "@/components/entity/entity-functions.ts";
import {EntityDialog, EntityDialogState, type EntityFormProps} from "@/components/entity/entity-dialog.tsx";

export interface EntityComboBoxProps<TEntity, TID> {
    value: TID | null,
    onChange: (value: TID | null) => void,
    functions: EntityListFunctions<TEntity, TID>
    optional: boolean,
    emptyLabel?: string,
    Form?: FunctionComponent<EntityFormProps<TEntity>>,
    i18nKey?: string
}

export function EntityComboBox<TEntity, TID>(props: EntityComboBoxProps<TEntity, TID>) {
    const {value, onChange, functions, optional, emptyLabel, Form, i18nKey} = props;

    const [options, setOptions] = useState<PagedResponse<TEntity>>({
        data: [],
        page: 0,
        pageSize: 0,
        totalElements: 0,
        totalPages: 0
    })

    const {workspace} = useWorkspace();
    useEffect(update, [workspace]);

    function update() {
        functions.list({
            sort: [],
            page: 0,
            workspace: workspace,
        }).then(setOptions).catch(showError);
    }

    const [dialogState, setDialogState] = useState<EntityDialogState>(EntityDialogState.Closed)

    return (
        <>
            {(Form && i18nKey) && <EntityDialog Form={Form}
                                                state={dialogState}
                                                setState={setDialogState}
                                                entity={null}
                                                i18nKey={i18nKey}
                                                onSubmit={entity => {
                                                    update()
                                                    onChange(functions.toId(entity))
                                                }}/>}

            <ComboBox value={value}
                      options={options.data}
                      toValue={functions.toId}
                      toStringValue={functions.format}
                      onChange={onChange}
                      emptyLabel={emptyLabel}
                      optional={optional}
                      createAction={(Form && i18nKey) ? (() => setDialogState(EntityDialogState.Creating)) : undefined}/>
        </>
    )
}