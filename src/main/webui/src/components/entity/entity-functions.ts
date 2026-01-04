    import type {DataQuery} from "@/components/data-table.tsx";
import type {PagedResponse} from "@/lib/types.ts";

export interface EntityFunctions<TEntity, TID> {
    list: (query: DataQuery) => Promise<PagedResponse<TEntity>>;
    delete: (id: TID) => Promise<void>;
    toId: (entity: TEntity) => TID;
    format: (entity: TEntity) => string;
}

interface PagedListProps {
    sort: string[];
    page: number;
}

interface WorkspacedListProps extends PagedListProps {
    workspaceId: number;
}

export function listV2<TEntity>(fn: (query: WorkspacedListProps) => Promise<PagedResponse<TEntity>>): (query: DataQuery) => Promise<PagedResponse<TEntity>> {
    return (query) => fn({page: query.page, sort: query.sort.map(s => JSON.stringify(s)), workspaceId: query.workspace.id!})
}

export function listV2Simple<TEntity>(fn: (query: PagedListProps) => Promise<PagedResponse<TEntity>>): (query: DataQuery) => Promise<PagedResponse<TEntity>> {
    return (query) => fn({page: query.page, sort: query.sort.map(s => JSON.stringify(s))})
}