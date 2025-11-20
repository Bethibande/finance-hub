import {ComboBox} from "./combobox.tsx";
import {
    type EntityActions,
    EntityDialog,
    type EntityDialogControls,
    type EntityEditForm,
    namespacedTranslations
} from "../views/data/EntityDialog.tsx";
import type {FieldValues} from "react-hook-form";
import {useEffect, useRef, useState} from "react";
import {useWorkspace} from "../lib/workspace.tsx";

export interface EntityComboBoxProps<TEntity, TForm extends FieldValues> {
    value?: TEntity,
    emptyLabel: string,
    onChange: (value: TEntity | null) => void,
    optional?: boolean,
    keyGenerator: (option: TEntity) => string,
    actions: EntityActions<TEntity>,
    form: EntityEditForm<TEntity, TForm>,
}

export function EntityComboBox<TEntity, TForm extends FieldValues>(props: EntityComboBoxProps<TEntity, TForm>) {
    const {actions, form, onChange} = props;
    const {i18nKey} = actions;

    const translations = namespacedTranslations(i18nKey)
    const controls = useRef<EntityDialogControls<TEntity>>(null)

    function create() {
        controls.current?.edit(undefined)
    }

    const {workspace} = useWorkspace()
    const [options, setOptions] = useState<TEntity[]>([])
    useEffect(() => {
        actions.load(workspace, {page: 0, size: 500, sort: []}).then(response => {
            if (response.ok) {
                response.json().then((page) => setOptions(page.data))
            }
        })
    }, [])

    const dialogActions: EntityActions<TEntity> = {
        ...actions,
        create: (entity) => actions.create(entity).then(response => {
            if (response.ok) {
                response.json().then((result) => onChange(result))
            }
            return response
        }),
    }

    return (
        <>
            <EntityDialog translations={translations} actions={dialogActions} form={form} ref={controls}/>
            <ComboBox {...props} render={actions.format} options={options} createAction={create}/>
        </>
    )
}