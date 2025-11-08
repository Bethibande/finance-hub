import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "../components/ui/card.tsx";
import {z} from "zod";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Field, FieldError, FieldGroup, FieldLabel} from "../components/ui/field.tsx";
import i18next from "i18next";
import {Input} from "../components/ui/input.tsx";
import {Button} from "../components/ui/button.tsx";
import {toast} from "sonner";
import {login} from "../lib/auth.ts";
import {showErrorMessage, showHttpError} from "../lib/errors.tsx";
import {useNavigate} from "react-router";

export default function LoginView() {
    const formSchema = z.object({
        username: z.string().min(3),
        password: z.string().min(3)
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: ""
        }
    })

    const navigate = useNavigate()

    function onSubmit(data: z.infer<typeof formSchema>) {
        login(data.username, data.password).then(({user, error}) => {
            if (user) {
                toast.success(i18next.t("login.welcome", {user: user}), {position: "top-center"})
                navigate("/")
            }
            if (error) {
                if (error.status === 401) {
                    showErrorMessage(i18next.t("login.error.credentials"))
                } else {
                    showHttpError(error)
                }
            }
        })
    }

    return (
        <div className={"w-full h-full flex items-center justify-center"}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card className={"w-96"}>
                    <CardHeader>
                        <CardTitle>{i18next.t("login")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FieldGroup>
                            <Controller name={"username"} control={form.control} render={({field, fieldState}) => {
                                return (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={"username"}>{i18next.t("username")}</FieldLabel>
                                        <Input {...field} id={"username"} type={"text"}
                                               aria-invalid={fieldState.invalid}
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
                                        <Input {...field} id={"password"} type={"password"}
                                               aria-invalid={fieldState.invalid}
                                               placeholder={"●●●●●●●●●"}/>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]}/>
                                        )}
                                    </Field>
                                )
                            }}/>
                        </FieldGroup>
                    </CardContent>
                    <CardFooter>
                        <Button type={"submit"} className={"w-full"}>{i18next.t("login")}</Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    )
}