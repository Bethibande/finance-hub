import {type EntityFormProps, handleSubmit} from "@/components/entity/entity-dialog.tsx";
import type {WorkspaceDTO} from "@/generated";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {FieldGroup} from "@/components/ui/field.tsx";
import {FormField} from "@/components/form-field.tsx";
import i18next from "i18next";
import {Input} from "@/components/ui/input.tsx";
import {WorkspaceApi} from "@/components/navigation/workspace/WorkspaceFunctions.ts";
import {showError} from "@/lib/errors.tsx";
import {useEffect} from "react";

export function WorkspaceForm(props: EntityFormProps<WorkspaceDTO>) {
    const formSchema = z.object({
        name: z.string().min(3).max(255),
    })

    const defaultValues: z.input<typeof formSchema> = {
        name: ""
    }

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues,
    })

    useEffect(() => {
        form.reset(props.entity || defaultValues)
    }, [props.entity])

    function submit(data: z.output<typeof formSchema>) {
        if (props.entity?.id) {
            WorkspaceApi.apiV2WorkspacePut({
                workspaceDTO: {
                    id: props.entity.id,
                    ...data,
                }
            }).then(props.onSubmit).catch(showError)
        } else {
            WorkspaceApi.apiV2WorkspacePost({
                workspaceDTOWithoutId: data
            }).then(props.onSubmit).catch(showError)
        }
    }

    return (
        <form onSubmit={handleSubmit(form, submit)}>
            {props.header}

            <FieldGroup>
                <FormField fieldName={"name"}
                           label={i18next.t("workspace.name")}
                           Input={props => (<Input {...props} placeholder={i18next.t("workspace.name.placeholder")}/>)}
                           control={form.control}/>
            </FieldGroup>

            {props.footer}
        </form>
    )
}