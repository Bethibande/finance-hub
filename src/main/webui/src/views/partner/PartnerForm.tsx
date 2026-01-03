import {type EntityFormProps, handleSubmit} from "@/components/entity/entity-dialog.tsx";
import {type PartnerDTO, PartnerType} from "@/generated";
import {FieldGroup} from "@/components/ui/field.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {PartnerAPI} from "@/views/partner/PartnerFunctions.ts";
import {showError} from "@/lib/errors.tsx";
import {useWorkspace} from "@/lib/workspace.tsx";
import {useEffect} from "react";
import {FormField} from "@/components/form-field.tsx";
import i18next from "i18next";
import {Input} from "@/components/ui/input.tsx";
import {Select} from "@/components/select.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";

export function PartnerForm(props: EntityFormProps<PartnerDTO>) {
    const {header, footer, entity, onSubmit} = props;

    const formSchema = z.object({
        name: z.string().min(3).max(255),
        type: z.enum(PartnerType),
        notes: z.string().max(1024),
    })

    const defaultValues: z.infer<typeof formSchema> = {
        name: "",
        type: PartnerType.Company,
        notes: "",
    }

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues
    })

    useEffect(() => {
        form.reset(entity || defaultValues)
    }, [entity])

    const {workspace} = useWorkspace()

    function submit(data: z.infer<typeof formSchema>) {
        if (entity?.id) {
            PartnerAPI.apiV2PartnerPut({
                partnerDTOWithoutWorkspace: {...data, id: entity.id}
            }).then(onSubmit).catch(showError)
        } else {
            PartnerAPI.apiV2PartnerPost({
                partnerDTOWithoutId: {...data, workspaceId: workspace.id!}
            }).then(onSubmit).catch(showError)
        }
    }

    return (
        <form onSubmit={handleSubmit(form, submit)}>
            {header}
            <FieldGroup>
                <div className={"flex gap-2"}>
                    <FormField fieldName={"name"}
                               label={i18next.t("partner.name")}
                               Input={(props) => (
                                   <Input {...props} placeholder={i18next.t("partner.name.placeholder")}/>
                               )}
                               control={form.control}/>
                    <FormField fieldName={"type"}
                               label={i18next.t("partner.type")}
                               Input={(props) => (
                                   <Select {...props}
                                           emptyLabel={i18next.t("select.empty")}
                                           options={Object.values(PartnerType)}
                                           keyGenerator={v => v}
                                           render={v => i18next.t("PartnerType." + v)}/>
                               )}
                               control={form.control}/>
                </div>
                <FormField fieldName={"notes"}
                           label={i18next.t("partner.notes")}
                           Input={(props) => (
                               <Textarea {...props} placeholder={i18next.t("partner.notes.placeholder")}/>
                           )}
                           control={form.control}/>
            </FieldGroup>
            {footer}
        </form>
    )
}