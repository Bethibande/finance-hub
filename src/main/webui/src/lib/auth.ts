interface UserDto {
    username: string;
    roles: string[];
}

async function login(username: string, password: string): Promise<UserDto | null> {
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
        return null;
    }

    return (await response.json()) as UserDto;
}

async function logout() {
    await fetch('/auth/logout')
}

export { login, logout };