import {EntityList} from "@/components/entity/entity-list.tsx";
import {JobAPI, JobFunctions} from "@/views/job/JobFunctions.ts";
import type {CellContext, ColumnDef} from "@tanstack/react-table";
import type {JobDTO} from "@/generated";
import i18next from "i18next";
import {renderDateTime} from "@/components/data-table.tsx";
import {type ReactNode, useState} from "react";
import {DropdownMenuItem} from "@/components/ui/dropdown-menu.tsx";
import {showError} from "@/lib/errors.tsx";

export function JobView() {
    const columns: ColumnDef<JobDTO>[] = [
        {
            id: "name",
            accessorKey: "name",
            header: i18next.t("job.name"),
            enableSorting: true
        },
        {
            id: "type",
            accessorKey: "type",
            header: i18next.t("job.type"),
            cell: ({row}) => i18next.t("JobType." + row.original.type),
            enableSorting: true
        },
        {
            id: "state",
            accessorKey: "state",
            header: i18next.t("job.state"),
            cell: ({row}) => i18next.t("JobState." + row.original.state),
            enableSorting: true
        },
        {
            id: "nextScheduledExecution",
            accessorKey: "nextScheduledExecution",
            header: i18next.t("job.nextScheduledExecution"),
            cell: ({row}) => {
                const date = row.original.nextScheduledExecution;
                return date ? renderDateTime(date) : i18next.t("job.nextScheduledExecution.never")
            },
            enableSorting: true
        },
        {
            id: "lastSuccessfulExecution",
            accessorKey: "lastSuccessfulExecution",
            header: i18next.t("job.lastSuccessfulExecution"),
            cell: ({row}) => {
                const date = row.original.lastSuccessfulExecution;
                return date ? renderDateTime(date) : i18next.t("job.lastSuccessfulExecution.never")
            },
            enableSorting: true,
        }
    ]

    const [version, setVersion] = useState<number>(0)

    const AdditionalActions: (ctx: CellContext<JobDTO, unknown>) => ReactNode = ({row}) => (
        <DropdownMenuItem onClick={() => {
            JobAPI.apiV2JobPut({
                jobDTOWithoutWorkspace: {...row.original, nextScheduledExecution: new Date()}
            }).then(() => setVersion(version + 1)).catch(showError)
        }}>
            {i18next.t("job.scheduleNow")}
        </DropdownMenuItem>
    )

    return (
        <EntityList functions={JobFunctions}
                    version={version}
                    columns={columns}
                    additionalActions={AdditionalActions}
                    i18nKey={"job"}/>
    )
}