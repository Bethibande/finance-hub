import {type EntityFormProps, handleSubmit} from "@/components/entity/entity-dialog.tsx";
import type {UserDTOWithoutPassword} from "@/generated";
import {z} from "zod";
import i18next from "i18next";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useEffect} from "react";
import {UserAPI} from "@/views/users/UserFunctions.ts";
import {showError} from "@/lib/errors.tsx";
import {FieldGroup} from "@/components/ui/field.tsx";
import {FormField} from "@/components/form-field.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Card} from "@/components/ui/card.tsx";
import {Person} from "react-bootstrap-icons";

export function PasswordResetForm(props: EntityFormProps<UserDTOWithoutPassword>) {
    const {header, footer, entity, onSubmit} = props;

    const formSchema = z.object({
        password: z.string().min(8).max(255),
        passwordRepeat: z.string().min(8).max(255),
    }).superRefine(({password, passwordRepeat}, ctx) => {
        if (password !== passwordRepeat) {
            ctx.addIssue({
                code: "custom",
                message: i18next.t("setup.user.passwords.dontMatch"),
                path: ["passwordRepeat"]
            })
        }
    })

    const defaultValues: z.infer<typeof formSchema> = {
        password: "",
        passwordRepeat: "",
    }

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues,
    })

    useEffect(() => {
        form.reset(defaultValues)
    }, [entity]);

    function submit(data: z.infer<typeof formSchema>) {
        if (entity?.id) {
            UserAPI.apiV2UserPasswordPatch({
                userDTOWithoutNameAndRoles: {id: entity.id, password: data.password},
            }).then(onSubmit).catch(showError)
        }
    }

    return (
        <form onSubmit={handleSubmit(form, submit)}>
            {header}
            <Card className={"flex-row items-center gap-2 pl-5 mb-3"}>
                <Person/>
                <p>{entity?.name}</p>
            </Card>
            <FieldGroup>
                <FormField fieldName={"password"}
                           label={i18next.t("user.password")}
                           Input={(props) => (
                               <Input {...props} type={"password"}
                                      placeholder={i18next.t("user.password.placeholder")}/>
                           )}
                           control={form.control}/>
                <FormField fieldName={"passwordRepeat"}
                           label={i18next.t("user.passwordRepeat")}
                           Input={(props) => (
                               <Input {...props} type={"password"}
                                      placeholder={i18next.t("user.password.placeholder")}/>
                           )}
                           control={form.control}/>
            </FieldGroup>
            {footer}
        </form>
    )
}