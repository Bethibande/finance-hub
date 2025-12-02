import {createBrowserRouter, type RouteObject, RouterProvider} from "react-router";
import ErrorLayout from "./layouts/ErrorLayout.tsx";
import Setup from "./views/setup/Setup.tsx";
import MainLayout from "./views/MainLayout.tsx";
import {ViewConfigProvider} from "./lib/view-config.tsx";
import LoginView from "./views/LoginView.tsx";
import {DashboardView} from "@/views/DashboardView.tsx";
import {AssetView} from "@/views/asset/AssetView.tsx";
import {PartnerView} from "@/views/partner/PartnerView.tsx";

const primaryRoutes: RouteObject[] = [
    {
        path: "/",
        Component: DashboardView,
    },
    {
        path: "/partners",
        Component: PartnerView,
    },
    {
        path: "/assets",
        Component: AssetView,
    }
]

const secondaryRoutes: RouteObject[] = [
    {
        path: "/setup",
        Component: Setup,
    },
    {
        path: "/login",
        Component: LoginView
    }
]

const router = createBrowserRouter([{
    children: [
        {
            children: primaryRoutes,
            Component: MainLayout
        },
        ...secondaryRoutes,
    ],
    ErrorBoundary: ErrorLayout
}])

function App() {
    return (
        <div className={"bg-muted w-full h-full"}>
            <ViewConfigProvider>
                <RouterProvider router={router}>

                </RouterProvider>
            </ViewConfigProvider>
        </div>
    )
}

export default App
