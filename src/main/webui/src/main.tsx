import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import i18next from "i18next";
import {WorkspaceProvider} from "./lib/workspace.tsx";

i18next.init({
    lng: 'en',
    resources: {
        en: {
            translation: {
                "setup.user.title": "Create admin user",
                "setup.user.description": "Create an admin user to manage the application",
                "setup.workspace.title": "Create a workspace",
                "setup.workspace.description": "Create your first workspace to start managing your finances",
                "setup.done.title": "That's it",
                "setup.done.description": "The setup is complete. You can now start using the application",
                "setup.user.passwords.dontMatch": "Passwords don't match",
                "next": "Next",
                "username": "Username",
                "password": "Password",
                "password.repeat": "Repeat password",
                "workspace": "Workspace",
            }
        }
    }
})

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <WorkspaceProvider>
            <App/>
        </WorkspaceProvider>
    </StrictMode>,
)
