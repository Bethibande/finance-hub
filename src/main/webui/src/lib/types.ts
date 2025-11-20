export const Direction = {
    Ascending: "Ascending",
    Descending: "Descending",
} as const;

export type Direction = typeof Direction[keyof typeof Direction];

export interface CRUDSortOrder {
    field: string;
    direction: Direction;
}

export interface Workspace {
    id?: number;
    name: string;
}

export interface Asset {
    id?: number;
    name: string;
    code: string;
    workspace: Workspace;
    provider: Partner | null;
    symbol: string | null;
    notes: string | null;
}

export const PartnerType = {
    BANK: "BANK",
    COMPANY: "COMPANY",
    PERSON: "PERSON",
    GOVERNMENTAL: "GOVERNMENTAL",
    EXCHANGE: "EXCHANGE",
    OTHER: "OTHER"
} as const;

export type PartnerType = (typeof PartnerType)[keyof typeof PartnerType];

export interface Partner {
    id?: number;
    name: string;
    type: PartnerType;
    workspace: Workspace;
    notes: string | null;
}

export interface Wallet {
    id?: number;
    name: string;
    workspace: Workspace;
    notes: string | null;
    provider: Partner | null;
    asset: Asset | null;
}

export const TransactionStatus = {
    OPEN: "OPEN",
    CLOSED: "CLOSED",
    CANCELLED: "CANCELLED"
} as const;

export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus];

export const TransactionType = {
    PAYMENT: "PAYMENT",
    BALANCE: "BALANCE",
} as const;

export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

export interface Transaction {
    id?: number;
    workspace: Workspace;
    name: string;
    amount: number;
    asset: Asset;
    date: string;
    status: TransactionStatus;
    bookedAmounts: BookedAmount[];
    type: TransactionType;
    wallet: Wallet;
    partner: Partner | null;
    internalRef: Transaction | null;
    notes: string | null;
}

export interface BookedAmount {
    id?: number;
    amount: number,
    asset: Asset;
    date: string;
    wallet: Wallet;
    notes?: string;
}

export const Role = {
    admin: "admin",
    user: "user",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export interface UserDto {
    name: string,
    roles: Role[]
}

export interface User {
    id?: number;
    name: string;
    roles: Role[];
    password: string | null;
}

export interface PagedResponse<T> {
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
    data: T[]
}

export interface ErrorResponse {
    code: number;
    message: string;
    translationKey: string;
}