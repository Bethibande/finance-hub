import {EntityList} from "@/components/entity/entity-list.tsx";
import {PartnerFunctions} from "@/views/partner/PartnerFunctions.ts";
import {PartnerForm} from "@/views/partner/PartnerForm.tsx";
import type {ColumnDef} from "@tanstack/react-table";
import type {PartnerDTO} from "@/generated";
import i18next from "i18next";

export function PartnerView() {
    const columns: ColumnDef<PartnerDTO>[] = [
        {
            id: "name",
            accessorKey: "name",
            header: i18next.t("partner.name"),
            enableSorting: true,
        },
        {
            id: "type",
            accessorKey: "type",
            header: i18next.t("partner.type"),
            cell: ({getValue}) => i18next.t("PartnerType." + getValue()),
            enableSorting: true,
        },
        {
            id: "notes",
            header: i18next.t("partner.notes"),
            accessorKey: "notes",
        }
    ]

    return (
        <EntityList functions={PartnerFunctions}
                    columns={columns}
                    i18nKey={"partner"}
                    Form={PartnerForm}/>
    )
}