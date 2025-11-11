import type {EntityActions, FieldProps} from "../data/EntityDialog.tsx";
import {Role, type User} from "../../lib/types.ts";
import {deleteClient, fetchClient, patch, post} from "../../lib/api.ts";
import type {ColumnDef} from "@tanstack/react-table";
import {EntityView} from "../data/EntityView.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {columnHeader} from "../../components/ui/table.tsx";
import i18next from "i18next";
import {ControlledInput, ControlledSelect} from "../../components/ControlledInput.tsx";

export const UserActions: EntityActions<User> = {
    load: (_workspace, page, size) => fetchClient("/api/v1/user?page=" + page + "&size=" + size),
    create: (user) => post("/api/v1/user", user),
    save: (user) => patch("/api/v1/user", user),
    delete: (user) => deleteClient("/api/v1/user/" + user.id),
    format: (user) => user.name,
}

export function useUserForm() {
    const formSchema = z.object({
        name: z.string().min(3).max(255),
        password: z.string().min(8).max(255).optional(),
        passwordRepeat: z.string().min(8).max(255).optional(),
        role: z.enum(Role)
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
        name: "",
        password: undefined,
        passwordRepeat: undefined,
        role: Role.user,
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues
    });

    function toEntity(data: z.infer<typeof formSchema>): User {
        return {
            ...data,
            roles: [data.role],
            password: (data.password && data.password.length >= 8) ? data.password : null
        }
    }

    function reset(entity?: User) {
        form.reset(entity ? {...entity, password: undefined, role: entity.roles[0]} : {...defaultValues, password: "", passwordRepeat: ""})
    }

    function fields(props: FieldProps) {
        const {editing} = props;

        return (
            <>
                <ControlledInput name={"name"}
                                 control={form.control}
                                 label={i18next.t("user.name")}/>
                {!editing && (
                    <div className={"flex gap-2"}>
                        <ControlledInput name={"password"}
                                         type={"password"}
                                         control={form.control}
                                         placeholder={"●●●●●●●●"}
                                         label={i18next.t("user.password")}/>
                        <ControlledInput name={"passwordRepeat"}
                                         type={"password"}
                                         control={form.control}
                                         placeholder={"●●●●●●●●"}
                                         label={i18next.t("user.password.repeat")}/>
                    </div>
                )}
                <ControlledSelect name={"role"}
                                  control={form.control}
                                  label={i18next.t("user.role")}
                                  options={Object.keys(Role)}
                                  render={role => i18next.t("Role." + role)}
                                  keyGenerator={role => role}/>
            </>
        )
    }

    return {form, toEntity, reset, fields}
}

export function UserView() {
    const columns: ColumnDef<User>[] = [
        {
            id: "name",
            header: columnHeader(i18next.t("user.name")),
            accessorKey: "name",
            enableSorting: true,
        },
        {
            id: "roles",
            header: i18next.t("user.role"),
            accessorKey: "roles",
            cell: ({row}) => row.original.roles.map(role => i18next.t("Role." + role)).join(", "),
        }
    ]

    return (
        <EntityView actions={UserActions}
                    columns={columns}
                    i18nKey={"user"}
                    editForm={useUserForm()}/>
    )
}