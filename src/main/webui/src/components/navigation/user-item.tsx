import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "../ui/dropdown-menu.tsx";
import {SidebarMenuButton, useSidebar} from "../ui/sidebar.tsx";
import {ChevronExpand, DoorClosed, Person} from "react-bootstrap-icons";
import i18next from "i18next";
import type {UserDto} from "../../lib/types.ts";

export default function UserItem() {
    const {isMobile} = useSidebar();

    const user: UserDto = {
        name: "admin",
        roles: ["ADMIN", "USER"]
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                    size={"lg"}
                    className={"data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"}
                >
                    <Person/>
                    <div className={"grid flex-1 text-left text-sm leading-tight"}>
                        <span className={"truncate font-medium"}>{user.name}</span>
                    </div>
                    <ChevronExpand className="ml-auto" />
                </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                align="start"
                side={isMobile ? "bottom" : "right"}
                sideOffset={4}>

                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 p-2" variant={"destructive"}>
                    <DoorClosed className="size-4" />
                    <div className="font-medium"> {i18next.t("logout")}</div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}