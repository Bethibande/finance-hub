"use client"

import * as React from "react";
import {type ReactNode, useState} from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "../ui/sidebar.tsx";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "../ui/collapsible.tsx";
import {Cash, ChevronDown, ClipboardData, Database, Sliders} from "react-bootstrap-icons";
import {NavLink} from "react-router";
import {cn} from "../../lib/utils.ts";
import WorkspaceSelect from "./workspace-select.tsx";
import UserItem from "./user-item.tsx";
import {Separator} from "../ui/separator.tsx";
import {useAuth} from "../../lib/auth.tsx";
import {Role, type UserDto} from "../../lib/types.ts";

export interface NavItem {
    text: string;
    icon?: React.ReactNode;
    suffix?: React.ReactNode;
    href?: string;
    children?: NavItem[];
    requiredRoles?: Role[];
}

function toGroup(item: NavItem, user?: UserDto): ReactNode | undefined {
    const children = item.children?.map((child) => toComponent(child, user));
    const [open, setOpen] = useState(true);

    return (
        <Collapsible open={open} onOpenChange={setOpen} key={item.text}>
            <CollapsibleTrigger asChild>
                {toBasicItem({...item, suffix: <ChevronDown className={cn("ml-auto transition-transform", open && "rotate-180")} />})}
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className={"border-l-2 pl-2 ml-[1.375rem]"}>
                    <SidebarMenu>
                        {children}
                    </SidebarMenu>
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}

function toBasicItem(item: NavItem): ReactNode {
    return (
        <SidebarMenuItem key={item.text}>
            <SidebarMenuButton className={"cursor-pointer transition-colors group-[.active]:bg-primary group-[.active]:text-primary-foreground"} asChild>
                <div className={"flex items-center gap-2 select-none py-5 p-4"}>
                    {item.icon}
                    {item.text}
                    {item.suffix}
                </div>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}

function toUrlItem(item: NavItem): ReactNode {
    return (
        <NavLink to={item.href || "#"} key={item.text} className={({isActive}) => cn("hover:underline group", isActive && "active")}>
            {toBasicItem(item)}
        </NavLink>
    )
}

function toComponent(item: NavItem, user?: UserDto): ReactNode | undefined {
    if (!checkPermissions(item, user)) return undefined;
    if (item.children) {
        return toGroup(item, user);
    } else if (item.href) {
        return toUrlItem(item);
    } else {
        return toBasicItem(item);
    }
}

function checkPermissions(item: NavItem, user?: UserDto) {
    if(!item.requiredRoles) return true;
    if (item.requiredRoles && user) {
        for (let role of user.roles) {
            if (item.requiredRoles.includes(role)) return true;
        }
    }
    return false;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const primary: NavItem[] = [
        {
            icon: <ClipboardData/>,
            text: "Dashboard",
            href: "/"
        },
    ];
    const secondary: NavItem[] = [
        {
            icon: <Cash/>,
            text: "Transactions",
            children: [
                {
                    text: "Payments",
                    href: "/payments"
                },
                {
                    text: "Recurring payments",
                    href: "/recurring-payments"
                }
            ]
        },
        {
            icon: <Database/>,
            text: "Organization",
            children: [
                {
                    text: "Wallets",
                    href: "/wallets"
                },
                {
                    text: "Assets",
                    href: "/assets"
                },
                {
                    text: "Partners",
                    href: "/partners"
                },
            ]
        },
        {
            icon: <Sliders/>,
            text: "Administration",
            requiredRoles: [Role.admin],
            children: [
                {
                    text: "Users",
                    href: "/users"
                },
            ]
        }
    ];

    const {user} = useAuth()

    const primaryItems = primary.map((item) => toComponent(item, user));
    const secondaryItems = secondary.map((item) => toComponent(item, user));

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <div className={"px-3 h-12 flex items-center gap-2"}>
                    <WorkspaceSelect/>
                </div>
            </SidebarHeader>
            <Separator className={"mt-[-1px]"}/>
            <SidebarHeader>
                {primaryItems}
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu className={"px-2"}>
                    {secondaryItems}
                </SidebarMenu>
            </SidebarContent>
            <Separator/>
            <SidebarFooter>
                <UserItem/>
            </SidebarFooter>
        </Sidebar>
    )
}
