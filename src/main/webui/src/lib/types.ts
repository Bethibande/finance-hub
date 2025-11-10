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
    notes?: string;
}

export interface Depot {
    id?: number;
    name: string;
    workspace: Workspace;
    notes?: string;
    provider?: Partner;
    asset?: Asset;
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
    amount: string;
    asset: Asset;
    date: Date;
    status: TransactionStatus;
    bookedAmounts: BookedAmount[];
    type: TransactionType;
    deopt: Depot;
    partner?: Partner;
    internalRef?: Transaction;
    notes?: string;
}

export interface BookedAmount {
    id?: number;
    amount: string,
    asset: Asset;
    date: Date;
    depot: Depot;
    notes?: string;
}

export interface UserDto {
    name: string,
    roles: string[]
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