import {createBrowserRouter, RouterProvider} from "react-router";
import ErrorLayout from "./layouts/ErrorLayout.tsx";
import Setup from "./views/setup/Setup.tsx";
import AssetView from "./views/assets/AssetView.tsx";
import MainLayout from "./views/MainLayout.tsx";
import {ViewConfigProvider} from "./lib/view-config.tsx";

function App() {
    const router = createBrowserRouter([{
        children: [
            {
                children: [
                    {
                        path: "/assets",
                        Component: AssetView
                    }
                ],
                Component: MainLayout
            },
            {
                path: "/setup",
                Component: Setup,
            }
        ],
        ErrorBoundary: ErrorLayout
    }])

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
