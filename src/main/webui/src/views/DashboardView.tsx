import {useViewConfig} from "@/lib/view-config.tsx";
import {useEffect} from "react";
import {PartnerEndpointApi} from "@/generated";

export function DashboardView() {
    const {setViewConfig} = useViewConfig();
    useEffect(() => {
        setViewConfig({
            toolbar: (<h2>Dashboard</h2>)
        })

        new PartnerEndpointApi().apiV2PartnerWorkspaceIdGet({
            workspaceId: 1,
        }).then(res => console.log(res))
    }, [])

    return (
        <div>
            <p>Dashboard</p>
        </div>
    )
}