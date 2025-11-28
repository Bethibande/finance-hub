export const Role = {
    admin: "admin",
    user: "user",
} as const;

export type Role = typeof Role[keyof typeof Role];

export interface SortOrder {
    field: string;
    direction: Direction;
}

export const Direction = {
    Ascending: "Ascending",
    Descending: "Descending",
} as const;

export type Direction = typeof Direction[keyof typeof Direction];