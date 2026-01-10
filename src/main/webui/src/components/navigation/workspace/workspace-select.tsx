import {useEffect, useState} from "react";
import {ChevronExpand, Plus} from "react-bootstrap-icons";
import i18next from "i18next";
import {type WorkspaceDTO, WorkspaceEndpointApi} from "@/generated";
import {showError} from "@/lib/errors.tsx";
import {useWorkspace} from "@/lib/workspace.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {SidebarMenuButton, useSidebar} from "@/components/ui/sidebar.tsx";
import Logo from "@/components/Logo.tsx";
import {EntityDialog, EntityDialogState} from "@/components/entity/entity-dialog.tsx";
import {WorkspaceForm} from "@/components/navigation/workspace/WorkspaceForm.tsx";
import {EntityDeleteDialog} from "@/components/entity/entity-delete-dialog.tsx";
import {WorkspaceFunctions} from "@/components/navigation/workspace/WorkspaceFunctions.ts";

export default function WorkspaceSelect() {
    const {isMobile} = useSidebar();

    const [version, setVersion] = useState<number>(0);
    const {workspace, setWorkspace} = useWorkspace();
    const [workspaces, setWorkspaces] = useState<WorkspaceDTO[]>([]);
    useEffect(() => {
        new WorkspaceEndpointApi().apiV2WorkspaceGet().then(dto => {
            setWorkspaces(dto.data)
        }).catch(showError)
    }, [version])

    useEffect(() => {
        if (workspaces.length === 0) {
            return
        }
        if (!workspaces.find((other) => other.id === workspace.id)) {
            setWorkspace(workspaces[0])
        }
    }, [workspaces]);

    const [dialogState, setDialogState] = useState<EntityDialogState>(EntityDialogState.Closed);
    const [deleteDialogState, setDeleteDialogState] = useState<boolean>(false);
    const [entity, setEntity] = useState<WorkspaceDTO | null>(null);

    function create() {
        setDialogState(EntityDialogState.Creating);
        setEntity(null);
    }

    function edit(workspace: WorkspaceDTO) {
        setEntity(workspace)
        setDialogState(EntityDialogState.Editing)
    }

    function del(workspace: WorkspaceDTO) {
        setEntity(workspace)
        setDeleteDialogState(true)
    }

    function doDelete() {
        if (entity?.id) {
            WorkspaceFunctions.delete(entity.id)
                .then(() => {
                    setVersion(version + 1)
                    setDeleteDialogState(false)
                })
                .catch(showError)
        }
    }

    return (
        <>
            <EntityDeleteDialog open={deleteDialogState}
                                close={() => setDeleteDialogState(false)}
                                display={entity ? WorkspaceFunctions.format(entity) : ""}
                                onDelete={doDelete}/>
            <EntityDialog Form={WorkspaceForm}
                          state={dialogState}
                          setState={setDialogState}
                          entity={entity}
                          onSubmit={(dto) => {
                              setVersion(version + 1)
                              if (dialogState === EntityDialogState.Creating || workspace.id === dto.id) {
                                  setWorkspace(dto)
                              }
                          }}
                          i18nKey={"workspace"}/>
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
                        <DropdownMenuSub key={workspace.name}>
                            <DropdownMenuSubTrigger className={"cursor-pointer"} onClick={() => setWorkspace(workspace)}>
                                {workspace.name}
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => setWorkspace(workspace)}>{i18next.t("use")}</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => edit(workspace)}>{i18next.t("edit")}</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => del(workspace)} variant={"destructive"}>{i18next.t("delete")}</DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                    ))}
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem onClick={create} className="gap-2 p-2">
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