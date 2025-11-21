import * as React from "react";
import {createContext, useContext, useState} from "react";
import type {Workspace} from "./types.ts";
import {fetchClient} from "@/lib/api.ts";
import {showHttpErrorAndContinue} from "@/lib/errors.tsx";

type WorkspaceContextType = {
    workspace: Workspace,
    setWorkspace: (workspace: Workspace) => void
}

export const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export const WorkspaceProvider = ({children}: { children: React.ReactNode }) => {
    const [workspace, setWorkspace] = useState<Workspace>(() => {
        const stored = window.localStorage.getItem('workspace');
        return stored ? JSON.parse(stored) : null;
    })

    if (!workspace) {
        // TODO: More graceful handling
        fetchClient("/api/v1/workspace").then(showHttpErrorAndContinue).then(res => {
            if (res.ok) {
                res.json().then(json => {
                    const data: Workspace[] = json.data
                    if (data.length > 0) {
                        setContext(data[0])
                    } else {
                        location.href = "/setup"
                    }
                });
            }
        })
    }

    const setContext = (newContext: Workspace) => {
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