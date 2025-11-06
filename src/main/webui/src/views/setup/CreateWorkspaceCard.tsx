import SetupCard from "./SetupCard.tsx";
import i18next from "i18next";
import {Input} from "../../components/ui/input.tsx";
import {Field, FieldError, FieldGroup, FieldLabel} from "../../components/ui/field.tsx";
import {z} from "zod";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {post} from "../../lib/api.ts";
import {useState} from "react";

export default function CreateWorkspaceCard(props: {next: () => void}) {
    const {next} = props;

    const [error, setError] = useState<string | undefined>(undefined);

    const formSchema = z.object({
        name: z.string().min(3)
    })
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: ""
        }
    })

    function onSubmit(data: z.infer<typeof formSchema>) {
        post("/api/v1/workspace", {
            name: data.name
        }).then(res => {
            if (res.ok) {
                next()
            } else {
                setError(res.statusText)
            }
        })
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <SetupCard title={"setup.workspace.title"} description={"setup.workspace.description"}>
                {error && <p className={"text-red-500 text-lg"}>{error}</p>}
                <FieldGroup>
                    <Controller name={"name"} control={form.control} render={({field, fieldState}) => {
                        return (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={"workspace-name"}>{i18next.t("workspace")}</FieldLabel>
                                <Input {...field} id={"workspace-name"} type={"text"} aria-invalid={fieldState.invalid} placeholder={"My workspace"}/>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )
                    }}/>
                </FieldGroup>
            </SetupCard>
        </form>
    )
}