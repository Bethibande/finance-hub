import {useNavigate} from "react-router";

interface ApiClientConfig {
    baseUrl?: string;
}

interface ApiClientOptions {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
}

export function buildClient(): ApiClientBuilder {
    return new ApiClientBuilder();
}

export class ApiClientBuilder {
    private config: ApiClientConfig = {};

    withBaseUrl(url: string): ApiClientBuilder {
        this.config.baseUrl = url;
        return this;
    }

    build(): ApiClient {
        return new ApiClient(this.config);
    }
}

export async function deleteClient(input: RequestInfo | URL,
                                   init?: RequestInit): Promise<Response> {
    return fetchClient(input, {
        method: "DELETE",
        ...init,
    })
}

export async function post(input: RequestInfo | URL,
                           body: any,
                           init?: RequestInit): Promise<Response> {
    return fetchClient(input, {
        body: JSON.stringify(body),
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...init?.headers,
        }
    })
}

export async function fetchClient(input: RequestInfo | URL,
                                  init?: RequestInit): Promise<Response> {
    return fetch(input, {
        ...init,
        headers: {
            "Accept": "application/json",
            ...init?.headers,
        }
    });
}

export class ApiClient {
    private readonly config: ApiClientConfig;

    constructor(config: ApiClientConfig) {
        this.config = config;
    }

    private resolveUrl(path: string): string {
        return `${this.config.baseUrl || ""}${path}`;
    }

    async fetch<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
        console.log(this.resolveUrl(path))
        const response = await fetch(this.resolveUrl(path), {
            method: options.method || "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                ...options.headers,
            },
            body: options.body ? JSON.stringify(options.body) : undefined,
            credentials: "include"
        });

        if (response.status === 401) {
            const navigate = useNavigate();
            navigate("/login");
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }
}