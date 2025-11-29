import type {DataQuery} from "@/components/data-table.tsx";
import type {PagedResponse} from "@/lib/types.ts";

export interface EntityListFunctions<TEntity, TID> {
    list: (query: DataQuery) => Promise<PagedResponse<TEntity>>;
    toId: (entity: TEntity) => TID;
    format: (entity: TEntity) => string;
}

interface WorkspacedListProps {
    sort: string[];
    page: number;
    workspaceId: number;
}

export function listV2<TEntity>(fn: (query: WorkspacedListProps) => Promise<PagedResponse<TEntity>>): (query: DataQuery) => Promise<PagedResponse<TEntity>> {
    return (query) => fn({page: query.page, sort: query.sort.map(s => JSON.stringify(s)), workspaceId: query.workspace.id!})
}