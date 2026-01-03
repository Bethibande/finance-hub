import type {FormEventHandler, FunctionComponent, ReactNode} from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import i18next from "i18next";
import type {FieldValues, UseFormReturn} from "react-hook-form";

export interface EntityFormProps<TEntity> {
    header?: ReactNode,
    footer?: ReactNode,
    close: () => void,
    onSubmit?: (entity: TEntity) => void,
    entity: TEntity | null,
}

export const EntityDialogState = {
    Editing: "Editing",
    Creating: "Creating",
    Closed: "Closed",
} as const;

export type EntityDialogState = typeof EntityDialogState[keyof typeof EntityDialogState];

export function handleSubmit<T1 extends FieldValues, T2, T3>(form: UseFormReturn<T1, T2, T3>, onSubmit: (data: T3) => void): FormEventHandler<HTMLFormElement> {
    return (e) => {
        e.stopPropagation();
        form.handleSubmit(onSubmit)(e);
    }
}

export interface EntityDialogProps<TEntity> {
    Form: FunctionComponent<EntityFormProps<TEntity>>,
    state: EntityDialogState,
    setState: (newState: EntityDialogState) => void,
    entity: TEntity | null,
    i18nKey: string,
    onSubmit?: (entity: TEntity) => void,
}

export function EntityDialog<TEntity>(props: EntityDialogProps<TEntity>) {
    const {Form, state, setState, entity, i18nKey, onSubmit} = props;

    function close() {
        setState(EntityDialogState.Closed)
    }

    const editing = state === EntityDialogState.Editing;
    const keyHeader = i18nKey + "." + (editing ? "editing.title" : "creating.title");
    const keyDescription = i18nKey + "." + (editing ? "editing.desc" : "creating.desc");

    return (
        <Dialog open={state !== EntityDialogState.Closed} onOpenChange={close}>
            <DialogContent>
                <Form entity={entity}
                      onSubmit={(entity) => {
                          setState(EntityDialogState.Closed);
                          if (onSubmit) onSubmit(entity);
                      }}
                      close={close}
                      header={(
                          <DialogHeader className={"mb-4"}>
                              <DialogTitle>{i18next.t(keyHeader)}</DialogTitle>
                              <DialogDescription>{i18next.t(keyDescription)}</DialogDescription>
                          </DialogHeader>
                      )}
                      footer={(
                          <DialogFooter className={"mt-4"}>
                              <Button variant={"outline"}
                                      type={"reset"}
                                      onClick={close}>{i18next.t("cancel")}</Button>
                              <Button>{editing ? i18next.t("save") : i18next.t("create")}</Button>
                          </DialogFooter>
                      )}/>
            </DialogContent>
        </Dialog>
    )
}