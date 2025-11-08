import {Outlet} from "react-router";
import {AppSidebar} from "../components/navigation/app-sidebar.tsx";
import {SidebarProvider, SidebarTrigger} from "../components/ui/sidebar.tsx";
import {useViewConfig} from "../lib/view-config.tsx";

export default function MainLayout() {
    const {viewConfig} = useViewConfig();

    return (
        <SidebarProvider>
            <AppSidebar/>
            <main className={"w-full h-full"}>
                <div className={"w-full p-3 bg-white border-b flex gap-2 items-center h-16"}>
                    <SidebarTrigger className={"size-10"}/>
                    { viewConfig.toolbar }
                </div>
                <div className={"w-full h-full p-5 overflow-y-auto"}>
                    <Outlet/>
                </div>
            </main>
        </SidebarProvider>
    )
}