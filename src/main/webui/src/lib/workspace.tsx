import * as React from "react";
import {createContext, useContext, useState} from "react";
import type {Workspace} from "./types.ts";

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