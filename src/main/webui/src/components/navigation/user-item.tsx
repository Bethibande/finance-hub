import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "../ui/dropdown-menu.tsx";
import {SidebarMenuButton, useSidebar} from "../ui/sidebar.tsx";
import {ChevronExpand, DoorClosed, Person} from "react-bootstrap-icons";
import i18next from "i18next";
import {useAuth} from "../../lib/auth.tsx";
import {useNavigate} from "react-router";

export default function UserItem() {
    const {isMobile} = useSidebar();

    const {user, logout} = useAuth();
    const navigate = useNavigate();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                    size={"lg"}
                    className={"data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"}
                >
                    <Person/>
                    <div className={"grid flex-1 text-left text-sm leading-tight"}>
                        <span className={"truncate font-medium"}>{user?.name}</span>
                    </div>
                    <ChevronExpand className="ml-auto" />
                </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                align="start"
                side={isMobile ? "bottom" : "right"}
                sideOffset={4}>
                <DropdownMenuItem onClick={() => logout().then(() => navigate("/login"))}
                                  className="gap-2 p-2"
                                  variant={"destructive"}>
                    <DoorClosed className="size-4"/>
                    <div className="font-medium"> {i18next.t("logout")}</div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}