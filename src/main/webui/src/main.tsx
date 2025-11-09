import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import i18next from "i18next";
import {WorkspaceProvider} from "./lib/workspace.tsx";
import {Toaster} from "./components/ui/sonner.tsx";
import {AuthProvider} from "./lib/auth.tsx";

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
                "views.asset.title": "Assets",
                "asset.dialog.title.create": "Create Asset",
                "asset.dialog.desc.create": "Create a new asset",
                "asset.dialog.title.edit": "Edit Asset",
                "asset.dialog.desc.edit": "Edit the asset '{{name}}'",
                "asset.name": "Name",
                "asset.code": "Code",
                "asset.symbol": "Symbol",
                "asset.notes": "Notes",
                "asset.notes.placeholder": "Some notes...",
                "menu.open": "Open menu",
                "menu.actions": "Actions",
                "next": "Next",
                "create": "Create",
                "delete": "Delete",
                "deleteN": "Delete {{n, number}}",
                "delete.confirmMessage": "Are you sure you want to delete this entry?",
                "cancel": "Cancel",
                "save": "Save",
                "edit": "Edit",
                "login": "Login",
                "login.error.credentials": "Invalid username or password",
                "login.error.load": "Failed to load authentication data. Please try again later.",
                "login.welcome": "Welcome {{user.name}}",
                "username": "Username",
                "password": "Password",
                "password.repeat": "Repeat password",
                "workspace": "Workspace",
                "workspace.name": "Name",
                "workspace.dialog.create.title": "Create Workspace",
                "workspace.dialog.create.desc": "Create a new workspace",
                "workspaces": "Workspaces",
                "workspace.create": "Create Workspace",
                "table.rows": "Rows total",
                "table.previous": "Previous",
                "table.next": "Next",
                "error.delete.dependents": "Cannot delete entry because it is referenced by other entities"
            }
        }
    }
})

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AuthProvider>
            <WorkspaceProvider>
                <App/>
                <Toaster/>
            </WorkspaceProvider>
        </AuthProvider>
    </StrictMode>,
)
