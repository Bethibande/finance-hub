import {useWorkspace} from "../../lib/workspace.tsx";
import {useEffect, useRef, useState} from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "../ui/dropdown-menu.tsx";
import {SidebarMenuButton, useSidebar} from "../ui/sidebar.tsx";
import {ChevronExpand, Plus, Trash} from "react-bootstrap-icons";
import Logo from "../Logo.tsx";
import type {Workspace} from "../../lib/types.ts";
import {Button} from "../ui/button.tsx";
import i18next from "i18next";
import {deleteClient, fetchClient, post} from "../../lib/api.ts";
import {showHttpErrorAndContinue} from "../../lib/errors.tsx";
import {
    type EntityActions,
    EntityDialog,
    type EntityDialogControls,
    type EntityDialogTranslations
} from "../../views/data/EntityDialog.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {ControlledInput} from "../ControlledInput.tsx";

export const WorkspaceDialogTranslations: EntityDialogTranslations = {
    create: {
        title: "workspace.dialog.create.title",
        description: "workspace.dialog.create.desc"
    },
    edit: {
        title: "workspace.dialog.edit.title",
        description: "workspace.dialog.edit.desc"
    }
}

export const WorkspaceActions: EntityActions<Workspace> = {
    format: (entity) => entity.name,
    create: (entity) => post("/api/v1/workspace", entity),
    save: (entity) => post("/api/v1/workspace", entity),
    delete: (entity) => deleteClient("/api/v1/workspace/" + entity.id),
    load: (_workspace, page, size) => fetchClient("/api/v1/workspace?page=" + page + "&size=" + size),
}

export function useWorkspaceForm() {
    const formSchema = z.object({
        name: z.string().min(3).max(255),
    })

    const defaults: z.infer<typeof formSchema> = {
        name: ""
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: defaults
    })

    function toEntity(data: z.infer<typeof formSchema>): Workspace {
        return data
    }

    function fields() {
        return (
            <>
                <ControlledInput name={"name"} control={form.control} label={i18next.t("workspace.name")}/>
            </>
        )
    }

    function reset(entity?: Workspace) {
        form.reset(entity || defaults)
    }

    return {form, toEntity, reset, fields}
}

export default function WorkspaceSelect() {
    const {isMobile} = useSidebar();

    const [version, setVersion] = useState(0)
    const {workspace, setWorkspace} = useWorkspace();
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    useEffect(() => {
        fetchClient("/api/v1/workspace").then(showHttpErrorAndContinue).then(res => {
            if (res.ok) {
                res.json().then(page => setWorkspaces(page.data))
            }
        })
    }, [version])

    useEffect(() => {
        if (workspaces.length === 0) {
            return
        }
        if (!workspaces.find((other) => other.id === workspace.id)) {
            setWorkspace(workspaces[0])
        }
    }, [workspaces]);

    const dialogControls = useRef<EntityDialogControls<Workspace> | undefined>(undefined)
    const actions: EntityActions<Workspace> = {
        ...WorkspaceActions,
        create: (workspace) => WorkspaceActions.create(workspace).then(response => {
            if (response.ok) {
                response.json().then(setWorkspace)
            }

            return response
        })
    }

    return (
        <>
            <EntityDialog translations={WorkspaceDialogTranslations}
                          actions={actions}
                          form={useWorkspaceForm()}
                          onChange={() => setVersion(version + 1)}
                          ref={dialogControls}/>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                        <Logo/>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">{workspace.name}</span>
                            <span className="truncate text-xs">{""}</span>
                        </div>
                        <ChevronExpand className="ml-auto"/>
                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                    align="start"
                    side={isMobile ? "bottom" : "right"}
                    sideOffset={4}>
                    <DropdownMenuLabel
                        className="text-muted-foreground text-xs">{i18next.t("workspaces")}</DropdownMenuLabel>
                    {workspaces.map((workspace) => (
                        <DropdownMenuItem
                            key={workspace.name}
                            onClick={() => setWorkspace(workspace)}
                            className="gap-2 p-2"
                        >
                            {workspace.name}
                            <Button className={"group ml-auto hover:bg-red-600"}
                                    size={"icon-sm"}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        dialogControls.current?.delete(workspace)
                                    }}
                                    variant={"ghost"}
                                    disabled={workspaces.length <= 1}>
                                <Trash className={"text-red-600 size-4 group-hover:text-white"}/>
                            </Button>
                        </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem onClick={() => dialogControls.current?.edit()} className="gap-2 p-2">
                        <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                            <Plus className="size-4"/>
                        </div>
                        <div className="text-muted-foreground font-medium">{i18next.t("workspace.create")}</div>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}