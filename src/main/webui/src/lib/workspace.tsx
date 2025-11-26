import * as React from "react";
import {createContext, useContext, useState} from "react";
import {type WorkspaceDTO, WorkspaceEndpointApi} from "@/generated";
import {showError} from "@/lib/errors.tsx";

type WorkspaceContextType = {
    workspace: WorkspaceDTO,
    setWorkspace: (workspace: WorkspaceDTO) => void
}

export const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export const WorkspaceProvider = ({children}: { children: React.ReactNode }) => {
    const [workspace, setWorkspace] = useState<WorkspaceDTO>(() => {
        const stored = window.localStorage.getItem('workspace');
        return stored ? JSON.parse(stored) : null;
    })

    if (!workspace) {
        // TODO: More graceful handling
        new WorkspaceEndpointApi().apiV2WorkspaceGet().then(res => {
                const data: WorkspaceDTO[] = res.data
                if (data.length > 0) {
                    setContext(data[0])
                } else {
                    location.href = "/setup"
                }
            }
        ).catch(showError)
    }

    const setContext = (newContext: WorkspaceDTO) => {
        setWorkspace(newContext)
        window.localStorage.setItem('workspace', JSON.stringify(newContext))
    }

    return (
        <WorkspaceContext.Provider value={{workspace, setWorkspace: setContext}}>
            {children}
        </WorkspaceContext.Provider>
    )
}


export const useWorkspace = () => {
    const context = useContext(WorkspaceContext)
    if (!context) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider')
    }
    return context;
}