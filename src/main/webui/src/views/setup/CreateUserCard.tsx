import SetupCard from "./SetupCard.tsx";
import {Field, FieldError, FieldGroup, FieldLabel} from "../../components/ui/field.tsx";
import i18next from "i18next";
import {Input} from "../../components/ui/input.tsx";
import {z} from "zod";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {post} from "@/lib/api.ts";
import {useState} from "react";
import {useAuth} from "../../lib/auth.tsx";

export default function CreateUserCard(props: { next: () => void }) {
    const {next} = props;

    const [error, setError] = useState<string | undefined>(undefined);

    const formSchema = z.object({
        username: z.string().min(3),
        password: z.string().min(8),
        passwordRepeat: z.string().min(8),
    }).superRefine(({password, passwordRepeat}, ctx) => {
        if (password !== passwordRepeat) {
            ctx.addIssue({
                code: "custom",
                message: i18next.t("setup.user.passwords.dontMatch"),
                path: ["passwordRepeat"]
            })
        }
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
            passwordRepeat: ""
        }
    })

    const {login} = useAuth()

    function onSubmit(data: z.infer<typeof formSchema>) {
        post("/api/v1/setup/user", {
            username: data.username,
            password: data.password
        }).then(res => {
            if (res.ok) {
                login(data.username, data.password).then(() => next())
            } else {
                setError(res.statusText)
            }
        })
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <SetupCard title={"setup.user.title"} description={"setup.user.description"}>
                {error && <p className={"text-red-500 text-lg"}>{error}</p>}
                <FieldGroup>
                    <Controller name={"username"} control={form.control} render={({field, fieldState}) => {
                        return (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={"username"}>{i18next.t("username")}</FieldLabel>
                                <Input {...field} id={"username"} type={"text"} aria-invalid={fieldState.invalid}
                                       placeholder={"Jon doe"}/>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]}/>
                                )}
                            </Field>
                        )
                    }}/>
                    <Controller name={"password"} control={form.control} render={({field, fieldState}) => {
                        return (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={"password"}>{i18next.t("password")}</FieldLabel>
                                <Input {...field} id={"password"} type={"password"} aria-invalid={fieldState.invalid}
                                       placeholder={"●●●●●●●●●"}/>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]}/>
                                )}
                            </Field>
                        )
                    }}/>
                    <Controller name={"passwordRepeat"} control={form.control} render={({field, fieldState}) => {
                        return (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={"password-repeat"}>{i18next.t("password.repeat")}</FieldLabel>
                                <Input {...field} id={"password-repeat"} type={"password"}
                                       aria-invalid={fieldState.invalid} placeholder={"●●●●●●●●●"}/>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]}/>
                                )}
                            </Field>
                        )
                    }}/>
                </FieldGroup>
            </SetupCard>
        </form>
    )
}