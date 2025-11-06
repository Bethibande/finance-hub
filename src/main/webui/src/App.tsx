import {createBrowserRouter, RouterProvider} from "react-router";
import ErrorLayout from "./layouts/ErrorLayout.tsx";
import Setup from "./views/setup/Setup.tsx";

function App() {
    const router = createBrowserRouter([{
        children: [{
            path: "/setup",
            Component: Setup
        }],
        ErrorBoundary: ErrorLayout
    }])

    return (
        <div className={"bg-muted w-full h-full"}>
            <RouterProvider router={router}>

            </RouterProvider>

        </div>
    )
}

export default App
