import {useViewConfig} from "@/lib/view-config.tsx";
import {useEffect} from "react";

export function DashboardView() {
    const {setViewConfig} = useViewConfig();
    useEffect(() => {
        setViewConfig({
            toolbar: (<h2>Dashboard</h2>)
        })
    })

    return (
        <div>
            <p>Dashboard</p>
        </div>
    )
}