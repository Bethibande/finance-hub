import {type EntityFormProps, handleSubmit} from "@/components/entity/entity-dialog.tsx";
import type {UserDTOWithoutPassword} from "@/generated";
import {z} from "zod";
import {Role} from "@/lib/types.ts";
import i18next from "i18next";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {FieldGroup} from "@/components/ui/field.tsx";
import {UserAPI} from "@/views/users/UserFunctions.ts";
import {showError} from "@/lib/errors.tsx";
import {FormField} from "@/components/form-field.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useEffect} from "react";
import {Select} from "@/components/select.tsx";

const formSchemaWithPassword = z.object({
    name: z.string().min(3).max(255),
    role: z.enum(Role),
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

const formSchemaWithoutPassword = z.object({
    name: z.string().min(3).max(255),
    role: z.enum(Role),
})

function UserFormWithoutPassword(props: EntityFormProps<UserDTOWithoutPassword>) {
    const {header, footer, entity, onSubmit} = props;

    const formSchema = formSchemaWithoutPassword

    const defaultValues: z.infer<typeof formSchema> = {
        name: "",
        role: Role.user,
    }

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues
    });

    useEffect(() => {
        form.reset(entity ? {...entity, role: entity.roles?.values().next().value as Role} : defaultValues);
    }, [entity])

    function submit(data: z.infer<typeof formSchema>) {
        if (entity?.id) {
            UserAPI.apiV2UserPut({
                userDTOWithoutPassword: {name: data.name, roles: new Set([data.role]), id: entity.id}
            }).then(onSubmit).catch(showError)
        }
    }

    return (
        <form onSubmit={handleSubmit(form, submit)}>
            {header}
            <FieldGroup>
                <div className={"flex gap-2"}>
                    <FormField fieldName={"name"}
                               label={i18next.t("user.name")}
                               Input={(props) => (
                                   <Input {...props} placeholder={i18next.t("user.name.placeholder")}/>
                               )}
                               control={form.control}/>
                    <FormField fieldName={"role"}
                               label={i18next.t("user.role")}
                               Input={(props) => (
                                   <Select {...props}
                                           options={Object.values(Role)}
                                           emptyLabel={i18next.t("select.empty")}
                                           keyGenerator={r => r}
                                           render={r => i18next.t("Role." + r)}/>
                               )}
                               control={form.control}/>
                </div>
            </FieldGroup>
            {footer}
        </form>
    )
}

function UserFormWithPassword(props: EntityFormProps<UserDTOWithoutPassword>) {
    const {header, footer, entity, onSubmit} = props;

    const formSchema = formSchemaWithPassword

    const defaultValues: z.infer<typeof formSchema> = {
        name: "",
        role: Role.user,
        password: "",
        passwordRepeat: "",
    }

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues
    });

    useEffect(() => {
        form.reset(entity || defaultValues);
    }, [entity])

    function submit(data: z.infer<typeof formSchema>) {
        if (!entity || !entity.id) {
            UserAPI.apiV2UserPost({
                // @ts-ignore
                userDTOWithoutId: {name: data.name, roles: new Set([data.role]), password: data.password},
            }).then(onSubmit).catch(showError)
        }
    }

    return (
        <form onSubmit={handleSubmit(form, submit)}>
            {header}
            <FieldGroup>
                <div className={"flex gap-2"}>
                    <FormField fieldName={"name"}
                               label={i18next.t("user.name")}
                               Input={(props) => (
                                   <Input {...props} placeholder={i18next.t("user.name.placeholder")}/>
                               )}
                               control={form.control}/>
                    <FormField fieldName={"role"}
                               label={i18next.t("user.role")}
                               Input={(props) => (
                                   <Select {...props}
                                           options={Object.values(Role)}
                                           emptyLabel={i18next.t("select.empty")}
                                           keyGenerator={r => r}
                                           render={r => i18next.t("Role." + r)}/>
                               )}
                               control={form.control}/>
                </div>
                <FormField fieldName={"password"}
                           label={i18next.t("user.password")}
                           Input={(props) => (
                               <Input {...props} type={"password"} placeholder={i18next.t("user.password.placeholder")}/>
                           )}
                           control={form.control}/>
                <FormField fieldName={"passwordRepeat"}
                           label={i18next.t("user.passwordRepeat")}
                           Input={(props) => (
                               <Input {...props} type={"password"} placeholder={i18next.t("user.password.placeholder")}/>
                           )}
                           control={form.control}/>
            </FieldGroup>
            {footer}
        </form>
    )
}

export function UserForm(props: EntityFormProps<UserDTOWithoutPassword>) {
    const {entity} = props;

    if (entity?.id) {
        return (<UserFormWithoutPassword {...props}/>)
    } else {
        return (<UserFormWithPassword {...props}/>)
    }
}