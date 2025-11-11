import {type FieldValues, type UseFormReturn} from "react-hook-form";
import {type FunctionComponent, type RefObject, useEffect, useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "../../components/ui/dialog.tsx";
import type {Workspace} from "../../lib/types.ts";
import {showError, showHttpErrorAndContinue} from "../../lib/errors.tsx";
import i18next from "i18next";
import {FieldGroup} from "../../components/ui/field.tsx";
import {Button} from "../../components/ui/button.tsx";
import {useWorkspace} from "../../lib/workspace.tsx";

export interface FieldProps {
    editing: boolean
}

export interface EntityEditForm<TEntity, TForm extends FieldValues> {
    form: UseFormReturn<TForm>,
    toEntity: (data: TForm, workspace: Workspace) => TEntity,
    reset: (entity?: TEntity) => void,
    fields: FunctionComponent<FieldProps>,
}

export interface EntityActions<TEntity> {
    load: (workspace: Workspace, page: number, size: number) => Promise<Response>,
    create: (entity: TEntity) => Promise<Response>,
    save: (entity: TEntity) => Promise<Response>,
    delete: (entity: TEntity) => Promise<Response>,
    format: (entity: TEntity) => string,
}

export const EntityDialogState = {
    EDITING: "EDITING",
    DELETING: "DELETING",
} as const

export type EntityDialogState = typeof EntityDialogState[keyof typeof EntityDialogState]

export interface EditDialogProps<TEntity, TForm extends FieldValues> {
    translations: EntityDialogTranslations,
    actions: EntityActions<TEntity>,
    form: EntityEditForm<TEntity, TForm>,
    ref: RefObject<EntityDialogControls<TEntity> | null>,
    onChange?: () => void,
}

export interface EntityDialogControls<TEntity> {
    edit: (entity?: TEntity) => void,
    delete: (entity: TEntity) => void,
    close: () => void,
}

export interface EntityDialogTranslations {
    edit: TitleAndDescription,
    create: TitleAndDescription,
}

export interface TitleAndDescription {
    title: string,
    description: string,
}

interface EditFormProps<TEntity, TForm extends FieldValues> {
    entity?: TEntity,
    format: (entity: TEntity) => string,
    form: EntityEditForm<TEntity, TForm>,
    translations: EntityDialogTranslations,
    close: () => void,
    onSubmit: (data: TForm) => void,
}

export function namespacedTranslations(i18nKey: string): EntityDialogTranslations {
    return {
        edit: {
            title: i18nKey + ".dialog.title.edit",
            description: i18nKey + ".dialog.desc.edit",
        },
        create: {
            title: i18nKey + ".dialog.title.create",
            description: i18nKey + ".dialog.desc.create",
        }
    }
}

export function EntityEditForm<TEntity, TForm extends FieldValues>(props: EditFormProps<TEntity, TForm>) {
    const {entity, format, form, onSubmit, translations, close} = props;

    const title = entity ? i18next.t(translations.edit.title) : i18next.t(translations.create.title)
    const description = entity ? i18next.t(translations.edit.description, {name: format(entity)}) : i18next.t(translations.create.description)

    return (
        <form onSubmit={e => {
            e.stopPropagation()
            form.form.handleSubmit(onSubmit)(e)
        }} className={"flex flex-col gap-4"}>
            <div className={"flex flex-col gap-4"}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <FieldGroup>
                    {<form.fields editing={!!entity}/>}
                </FieldGroup>

                <DialogFooter>
                    <Button onClick={close} type={"reset"} variant={"secondary"}>{i18next.t("cancel")}</Button>
                    <Button>{i18next.t("save")}</Button>
                </DialogFooter>
            </div>
        </form>
    )
}

interface DeleteFormProps<TEntity> {
    actions: EntityActions<TEntity>,
    entity: TEntity,
    close: () => void,
    onDelete?: () => void,
}

export function EntityDeleteForm<TEntity>(props: DeleteFormProps<TEntity>) {
    const {actions, entity, close, onDelete} = props;

    function confirmDelete() {
        actions.delete(entity).then(showHttpErrorAndContinue).then((response) => {
            if (response.ok) {
                close()
                onDelete?.()
            }
        }).catch(showError)
    }

    return (
        <>
            <DialogHeader>
                <DialogTitle>{i18next.t("delete")} {actions.format(entity)}</DialogTitle>
            </DialogHeader>

            <div>
                <p>{i18next.t("delete.confirmMessage")}</p>
            </div>

            <DialogFooter>
                <Button onClick={close} variant={"secondary"}>{i18next.t("cancel")}</Button>
                <Button onClick={() => confirmDelete()} variant={"destructive"}>{i18next.t("delete")}</Button>
            </DialogFooter>
        </>
    )
}

export function EntityDialog<TEntity, TForm extends FieldValues>(props: EditDialogProps<TEntity, TForm>) {
    const {actions, form, ref, translations, onChange} = props;
    const {workspace} = useWorkspace()

    const [open, setOpen] = useState(false);
    const [state, setState] = useState<EntityDialogState>(EntityDialogState.EDITING);
    const [entity, setEntity] = useState<TEntity | undefined>(undefined);

    useEffect(() => {
        function edit(entity?: TEntity) {
            setEntity(entity)
            form.reset(entity)
            setState(EntityDialogState.EDITING)
            setOpen(true)
        }

        function del(entity: TEntity) {
            setEntity(entity)
            setState(EntityDialogState.DELETING)
            setOpen(true)
        }

        function close() {
            setOpen(false)
        }

        ref.current = {edit, delete: del, close}
    }, [])

    function confirmSave(data: TForm) {
        const submittedEntity: TEntity = form.toEntity(data, workspace)

        if (entity) {
            actions.save({
                ...entity,
                ...submittedEntity
            }).then(showHttpErrorAndContinue).then((response) => {
                if (response.ok) {
                    ref.current?.close()
                    onChange?.()
                }
            }).catch(showError)
        } else {
            actions.create(submittedEntity).then(showHttpErrorAndContinue).then((response) => {
                if (response.ok) {
                    ref.current?.close()
                    onChange?.()
                }
            }).catch(showError)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                {state === EntityDialogState.EDITING && (<EntityEditForm translations={translations}
                                                                         entity={entity}
                                                                         format={actions.format}
                                                                         form={form}
                                                                         close={() => setOpen(false)}
                                                                         onSubmit={confirmSave}/>)}
                {state === EntityDialogState.DELETING && (<EntityDeleteForm actions={actions}
                                                                            entity={entity!}
                                                                            onDelete={onChange}
                                                                            close={() => setOpen(false)}/>)}
            </DialogContent>
        </Dialog>
    )
}