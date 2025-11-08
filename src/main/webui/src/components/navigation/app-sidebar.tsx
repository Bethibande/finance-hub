"use client"

import {type ReactNode, useState} from "react";
import * as React from "react"
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
import {Cash, ChevronDown, ClipboardData, Database} from "react-bootstrap-icons";
import {NavLink} from "react-router";
import {cn} from "../../lib/utils.ts";

export interface NavItem {
    text: string;
    icon?: React.ReactNode;
    suffix?: React.ReactNode;
    href?: string;
    children?: NavItem[];
}

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
        text: "Master data",
        children: [
            {
                text: "Depots",
                href: "/depots"
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
    }
];

function toGroup(item: NavItem): ReactNode {
    const children = item.children?.map((child) => toComponent(child));
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

function toComponent(item: NavItem): ReactNode {
    if (item.children) {
        return toGroup(item);
    } else if (item.href) {
        return toUrlItem(item);
    } else {
        return toBasicItem(item);
    }
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const primaryItems = primary.map((item) => toComponent(item));
    const secondaryItems = secondary.map((item) => toComponent(item));

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                {primaryItems}
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu className={"px-2"}>
                    {secondaryItems}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
            </SidebarFooter>
        </Sidebar>
    )
}
