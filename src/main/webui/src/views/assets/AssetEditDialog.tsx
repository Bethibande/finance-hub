import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "../../components/ui/dialog.tsx";
import type {Asset} from "../../lib/types.ts";
import {Button} from "../../components/ui/button.tsx";
import i18next from "i18next";
import {z} from "zod";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Field, FieldError, FieldGroup, FieldLabel} from "../../components/ui/field.tsx";
import {Input} from "../../components/ui/input.tsx";
import {useEffect} from "react";
import {Textarea} from "../../components/ui/textarea.tsx";
import {EntityDialogState, type EntityEditDialogProps} from "../data/EntityView.tsx";
import {useWorkspace} from "../../lib/workspace.tsx";
import {showError} from "../../lib/errors.tsx";

export default function AssetEditDialog(props: EntityEditDialogProps<Asset>) {
    const {entity, state, close, actions} = props;
    const {workspace} = useWorkspace()

    const formSchema = z.object({
        name: z.string().min(3).max(255),
        code: z.string().min(3).max(8),
        symbol: z.string().min(1).max(10).optional(),
        notes: z.string().min(0).max(1024).optional(),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            code: ""
        }
    })

    function onSubmit(data: z.infer<typeof formSchema>) {
        const submittedEntity: Asset = {
            name: data.name,
            code: data.code,
            symbol: data.symbol,
            notes: data.notes,
            workspace: workspace
        }

        if (entity) {
            actions.save({
                ...entity,
                ...submittedEntity
            }).then(() => close()).catch(showError)
        } else {
            actions.create(submittedEntity).then(() => close()).catch(showError)
        }
    }

    useEffect(() => {
        if (state !== EntityDialogState.CLOSED) {
            form.reset()
            if (entity) {
                form.setValue("name", entity.name)
                form.setValue("code", entity.code)
                form.setValue("symbol", entity.symbol || undefined)
                form.setValue("notes", entity.notes || undefined)
            }
        }
    }, [state]);

    function confirmDelete() {
        if (entity) {
            actions.delete(entity)
                .then(() => close())
                .catch(showError)
        }
    }

    return (
        <Dialog open={state !== EntityDialogState.CLOSED} onOpenChange={() => close()}>
            { state === EntityDialogState.DELETING && (
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{i18next.t("delete")} {entity?.name}</DialogTitle>
                    </DialogHeader>

                    <div>
                        <p>{i18next.t("delete.confirmMessage")}</p>
                    </div>

                    <DialogFooter>
                        <Button onClick={close} variant={"secondary"}>{i18next.t("cancel")}</Button>
                        <Button onClick={() => confirmDelete()} variant={"destructive"}>{i18next.t("delete")}</Button>
                    </DialogFooter>
                </DialogContent>
            ) }
            { state === EntityDialogState.EDITING && (
                <DialogContent>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className={"flex flex-col gap-4"}>
                            <DialogHeader>
                                <DialogTitle>{entity && i18next.t("asset.dialog.title.edit") || i18next.t("asset.dialog.title.create")}</DialogTitle>
                                <DialogDescription>{entity && i18next.t("asset.dialog.desc.edit", {name: entity.name}) || i18next.t("asset.dialog.desc.create")}</DialogDescription>
                            </DialogHeader>

                            <FieldGroup>
                                <Controller name={"name"} control={form.control} render={({field, fieldState}) => {
                                    return (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={"name"}>{i18next.t("asset.name")}</FieldLabel>
                                            <Input {...field} id={"name"} type={"text"} aria-invalid={fieldState.invalid}
                                                   placeholder={"Euro"}/>
                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]}/>
                                            )}
                                        </Field>
                                    )
                                }}/>

                                <div className={"flex gap-2"}>
                                    <Controller name={"code"} control={form.control} render={({field, fieldState}) => {
                                        return (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={"code"}>{i18next.t("asset.code")}</FieldLabel>
                                                <Input {...field} id={"code"} type={"text"} aria-invalid={fieldState.invalid}
                                                       placeholder={"EUR"}/>
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]}/>
                                                )}
                                            </Field>
                                        )
                                    }}/>

                                    <Controller name={"symbol"} control={form.control} render={({field, fieldState}) => {
                                        return (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={"symbol"}>{i18next.t("asset.symbol")}</FieldLabel>
                                                <Input {...field} id={"symbol"} type={"text"} aria-invalid={fieldState.invalid}
                                                       placeholder={"€"}/>
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]}/>
                                                )}
                                            </Field>
                                        )
                                    }}/>
                                </div>

                                <Controller name={"notes"} control={form.control} render={({field, fieldState}) => {
                                    return (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={"notes"}>{i18next.t("asset.notes")}</FieldLabel>
                                            <Textarea {...field} id={"notes"} aria-invalid={fieldState.invalid}
                                                      placeholder={i18next.t("asset.notes.placeholder")}/>
                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]}/>
                                            )}
                                        </Field>
                                    )
                                }}/>
                            </FieldGroup>

                            <DialogFooter>
                                <Button onClick={() => close()} type={"reset"} variant={"secondary"}>{i18next.t("cancel")}</Button>
                                <Button>{i18next.t("save")}</Button>
                            </DialogFooter>
                        </div>
                    </form>
                </DialogContent>
            ) }
        </Dialog>
    )
}
