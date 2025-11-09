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
import {showError} from "../../lib/errors.tsx";
import i18next from "i18next";
import {FieldGroup} from "../../components/ui/field.tsx";
import {Button} from "../../components/ui/button.tsx";
import {useWorkspace} from "../../lib/workspace.tsx";

export interface EntityEditForm<TEntity, TForm extends FieldValues> {
    form: UseFormReturn<TForm>,
    toEntity: (data: TForm, workspace: Workspace) => TEntity,
    reset: (entity?: TEntity) => void,
    fields: FunctionComponent,
}

export interface EntityActions<TEntity> {
    load: (workspace: Workspace, page: number, size: number) => Promise<Response>,
    create: (entity: TEntity) => Promise<any>,
    save: (entity: TEntity) => Promise<any>,
    delete: (entity: TEntity) => Promise<any>,
    format: (entity: TEntity) => string,
}

export const EntityDialogState = {
    CLOSED: "CLOSED",
    EDITING: "EDITING",
    DELETING: "DELETING",
} as const

export type EntityDialogState = typeof EntityDialogState[keyof typeof EntityDialogState]

export interface EditDialogProps<TEntity, TForm extends FieldValues> {
    translations: EntityDialogTranslations,
    actions: EntityActions<TEntity>,
    form: EntityEditForm<TEntity, TForm>,
    ref: RefObject<EntityDialogControls<TEntity> | undefined>,
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
    onSubmit: (data: TForm) => void,
}

export function EntityEditForm<TEntity, TForm extends FieldValues>(props: EditFormProps<TEntity, TForm>) {
    const {entity, format, form, onSubmit, translations} = props;

    const title = entity ? i18next.t(translations.edit.title) : i18next.t(translations.create.title)
    const description = entity ? i18next.t(translations.edit.description, {name: format(entity)}) : i18next.t(translations.create.description)

    return (
        <form onSubmit={form.form.handleSubmit(onSubmit)} className={"flex flex-col gap-4"}>
            <div className={"flex flex-col gap-4"}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <FieldGroup>
                    {<form.fields/>}
                </FieldGroup>

                <DialogFooter>
                    <Button onClick={() => close()} type={"reset"} variant={"secondary"}>{i18next.t("cancel")}</Button>
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
}

export function EntityDeleteForm<TEntity>(props: DeleteFormProps<TEntity>) {
    const {actions, entity, close} = props;

    function confirmDelete() {
        actions.delete(entity).then(() => close()).catch(showError)
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
    const {actions, form, ref, translations} = props;
    const {workspace} = useWorkspace()

    const [state, setState] = useState<EntityDialogState>(EntityDialogState.CLOSED);
    const [entity, setEntity] = useState<TEntity | undefined>(undefined);

    useEffect(() => {
        function edit(entity?: TEntity) {
            setEntity(entity)
            form.reset(entity)
            setState(EntityDialogState.EDITING)
        }

        function del(entity: TEntity) {
            setEntity(entity)
            setState(EntityDialogState.DELETING)
        }

        function close() {
            setState(EntityDialogState.CLOSED)
        }

        ref.current = {edit, delete: del, close}
    }, [])

    function confirmSave(data: TForm) {
        const submittedEntity: TEntity = form.toEntity(data, workspace)

        if (entity) {
            actions.save({
                ...entity,
                ...submittedEntity
            }).then(() => ref.current?.close()).catch(showError)
        } else {
            actions.create(submittedEntity).then(() => ref.current?.close()).catch(showError)
        }
    }

    return (
        <Dialog open={state !== EntityDialogState.CLOSED} onOpenChange={() => ref.current?.close()}>
            <DialogContent>
                {state === EntityDialogState.EDITING && (<EntityEditForm translations={translations}
                                                                         entity={entity}
                                                                         format={actions.format}
                                                                         form={form}
                                                                         onSubmit={confirmSave}/>)}
                {state === EntityDialogState.DELETING && (<EntityDeleteForm actions={actions}
                                                                            entity={entity!}
                                                                            close={() => ref.current?.close()}/>)}
            </DialogContent>
        </Dialog>
    )
}