import {EntityView} from "../data/EntityView.tsx";
import type {EntityActions} from "../data/EntityDialog.tsx";
import {type Partner, PartnerType, type Workspace} from "../../lib/types.ts";
import type {ColumnDef} from "@tanstack/react-table";
import {deleteClient, fetchClient, post} from "../../lib/api.ts";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {ControlledInput, ControlledSelect, ControlledTextArea} from "../../components/ControlledInput.tsx";
import i18next from "i18next";

export const PartnerActions: EntityActions<Partner> = {
    load: (workspace, page, size) => fetchClient("/api/v1/partner/workspace/" + workspace.id + "?page=" + page + "&size=" + size),
    create: (partner) => post("/api/v1/partner", partner),
    delete: (partner) => deleteClient("/api/v1/partner/" + partner.id),
    save: (partner) => post("/api/v1/partner", partner),
    format: (partner) => partner.name
}

export function usePartnerEditForm() {
    const formSchema = z.object({
        name: z.string().min(3).max(255),
        type: z.enum(PartnerType),
        notes: z.string().min(0).max(1024).optional(),
    })

    const defaultValues: z.infer<typeof formSchema> = {
        name: "",
        type: "COMPANY",
        notes: undefined
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues
    })

    function toEntity(data: z.infer<typeof formSchema>, workspace: Workspace): Partner {
        return {
            ...data,
            workspace: workspace
        }
    }

    function reset(entity?: Partner) {
        form.reset(entity || defaultValues)
    }

    function fields() {
        return (
            <>
                <div className={"flex gap-2"}>
                    <ControlledInput name={"name"}
                                     control={form.control}
                                     label={i18next.t("partner.name")}
                                     placeholder={"Apple inc."}/>
                    <ControlledSelect name={"type"}
                                      control={form.control}
                                      label={i18next.t("partner.type")}
                                      render={(option) => i18next.t("PartnerType." + option)}
                                      keyGenerator={option => option}
                                      options={Object.keys(PartnerType)}/>
                </div>
                <ControlledTextArea name={"notes"}
                                    control={form.control}
                                    label={i18next.t("partner.notes")}
                                    placeholder={i18next.t("partner.notes.placeholder")}/>
            </>
        )
    }

    return {form, toEntity, reset, fields, formSchema}
}

export default function PartnerView() {
    const columns: ColumnDef<Partner>[] = [
        {
            id: "name",
            header: i18next.t("partner.name"),
            accessorKey: "name",
        },
        {
            id: "type",
            header: i18next.t("partner.type"),
            cell: ({row}) => i18next.t("PartnerType." + row.original.type),
            accessorKey: "type",
        },
        {
            id: "notes",
            header: i18next.t("partner.notes"),
            accessorKey: "notes",
        }
    ]

    return (
        <EntityView actions={PartnerActions}
                    columns={columns}
                    i18nKey={"partner"}
                    editForm={usePartnerEditForm()}/>
    )
}