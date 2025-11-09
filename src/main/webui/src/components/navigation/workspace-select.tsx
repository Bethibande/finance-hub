import {useWorkspace} from "../../lib/workspace.tsx";
import {useEffect, useState} from "react";
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
import {fetchClient} from "../../lib/api.ts";
import {showHttpError} from "../../lib/errors.tsx";

export default function WorkspaceSelect() {
    const {isMobile} = useSidebar();

    const [version, setVersion] = useState(0)
    const {workspace, setWorkspace} = useWorkspace();
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    useEffect(() => {
        fetchClient("/api/v1/workspace").then(res => {
            if (!res.ok) {
                showHttpError(res)
                return
            }

            res.json().then(page => setWorkspaces(page.data))
        })
    }, [version])

    return (
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
                    <ChevronExpand className="ml-auto" />
                </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                align="start"
                side={isMobile ? "bottom" : "right"}
                sideOffset={4}>
                <DropdownMenuLabel className="text-muted-foreground text-xs">{i18next.t("workspaces")}</DropdownMenuLabel>
                {workspaces.map((workspace) => (
                    <DropdownMenuItem
                        key={workspace.name}
                        onClick={() => setWorkspace(workspace)}
                        className="gap-2 p-2"
                    >
                        {workspace.name}
                        <Button className={"group ml-auto hover:bg-red-600"} size={"icon-sm"} variant={"ghost"}><Trash className={"text-red-600 size-4 group-hover:text-white"}/></Button>
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 p-2">
                    <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                        <Plus className="size-4" />
                    </div>
                    <div className="text-muted-foreground font-medium">{i18next.t("workspace.create")}</div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}