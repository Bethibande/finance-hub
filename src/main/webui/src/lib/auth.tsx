import type {UserDto} from "./types.ts";
import {createContext, type ReactNode, useContext, useEffect, useState} from "react";
import {fetchClient, post} from "./api.ts";
import {showError, showErrorMessage} from "./errors.tsx";
import i18next from "i18next";

export interface LoginResult {
    user?: UserDto;
    error?: Response;
}

async function login(username: string, password: string): Promise<LoginResult> {
    const response = await post("/auth/login", {username, password});

    if (!response.ok) {
        // Handle HTTP error (e.g. 401)
        console.error('Login failed:', response.status);
        return {user: undefined, error: response};
    }

    const user = (await response.json()) as UserDto;
    console.log("Logged in as " + user.name)
    return {user};
}

async function logout() {
    await fetch('/auth/logout')
}

export interface AuthStatus {
    user?: UserDto;
    pending: boolean;
    login: (username: string, password: string) => Promise<LoginResult>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthStatus | undefined>(undefined);

export const AuthProvider = ({children}: { children: ReactNode }) => {
    const [auth, setAuth] = useState<UserDto | undefined>(undefined);
    const [pending, setPending] = useState<boolean>(true);

    useEffect(() => {
        fetchClient("/auth/me").then(response => {
            if (response.status === 404) {
                setAuth(undefined);
                setPending(false);
            } else if (response.ok) {
                response.json().then(user => {
                    setAuth(user)
                    setPending(false)
                })
            } else {
                showErrorMessage(i18next.t("login.error.load"))
            }
        }).catch(showError)
    }, [])

    async function login0(username: string, password: string) {
        return login(username, password).then(result => {
            setAuth(result.user)
            return result
        })
    }

    async function logout0() {
        await logout().then(() => setAuth(undefined))
    }

    return (
        <AuthContext.Provider value={{user: auth, pending: pending, login: login0, logout: logout0}}>
            {!pending && children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within a AuthProvider');
    }
    return context;
}