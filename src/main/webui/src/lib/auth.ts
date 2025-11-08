import type {UserDto} from "./types.ts";

export interface LoginResult {
    user?: UserDto;
    error?: Response;
}

async function login(username: string, password: string): Promise<LoginResult> {
    const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        // Handle HTTP error (e.g. 401)
        console.error('Login failed:', response.status);
        return { user: undefined, error: response };
    }

    const user = (await response.json()) as UserDto;
    return { user };
}

async function logout() {
    await fetch('/auth/logout')
}

export { login, logout };