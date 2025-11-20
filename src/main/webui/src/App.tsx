import {createBrowserRouter, type RouteObject, RouterProvider} from "react-router";
import ErrorLayout from "./layouts/ErrorLayout.tsx";
import Setup from "./views/setup/Setup.tsx";
import AssetView from "./views/assets/AssetView.tsx";
import MainLayout from "./views/MainLayout.tsx";
import {ViewConfigProvider} from "./lib/view-config.tsx";
import LoginView from "./views/LoginView.tsx";
import DashboardView from "./views/DashboardView.tsx";
import PartnerView from "./views/partners/PartnerView.tsx";
import {WalletView} from "./views/WalletView.tsx";
import {UserView} from "./views/users/UserView.tsx";
import {TransactionView} from "./views/payments/Payments.tsx";

const primaryRoutes: RouteObject[] = [
    {
        path: "/",
        Component: DashboardView
    },
    {
        path: "/payments",
        Component: TransactionView
    },
    {
        path: "/assets",
        Component: AssetView,
    },
    {
        path: "/partners",
        Component: PartnerView,
    },
    {
        path: "/wallets",
        Component: WalletView,
    },
    {
        path: "/users",
        Component: UserView,
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
