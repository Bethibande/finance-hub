import {EntityList} from "@/components/entity/entity-list.tsx";
import {UserForm} from "@/views/users/UserForm.tsx";
import {UserFunctions} from "@/views/users/UserFunctions.ts";
import type {ColumnDef} from "@tanstack/react-table";
import type {UserDTOWithoutPassword} from "@/generated";
import i18next from "i18next";
import {useState} from "react";
import {EntityDialog, EntityDialogState} from "@/components/entity/entity-dialog.tsx";
import {PasswordResetForm} from "@/views/users/PasswordResetForm.tsx";
import {DropdownMenuItem} from "@/components/ui/dropdown-menu.tsx";

export function UserView() {
    const columns: ColumnDef<UserDTOWithoutPassword>[] = [
        {
            id: "name",
            accessorKey: "name",
            header: i18next.t("user.name"),
            enableSorting: true,
        },
        {
            id: "role",
            accessorKey: "roles",
            cell: ({row}) => i18next.t("Role." + row.original.roles?.values()?.next()?.value),
            header: i18next.t("user.role"),
            enableSorting: true,
        },
    ]

    const [passwordReset, setPasswordReset] = useState<UserDTOWithoutPassword | null>(null);

    return (
        <>
            <EntityDialog Form={PasswordResetForm}
                          state={passwordReset ? EntityDialogState.Editing : EntityDialogState.Closed}
                          setState={() => setPasswordReset(null)}
                          entity={passwordReset}
                          i18nKey={"user"}/>

            <EntityList functions={UserFunctions}
                        columns={columns}
                        i18nKey={"user"}
                        Form={UserForm}
                        additionalActions={({row}) => (
                            <DropdownMenuItem onClick={() => setPasswordReset(row.original)}>
                                {i18next.t("user.reset.password")}
                            </DropdownMenuItem>
                        )}/>
        </>
    )
}