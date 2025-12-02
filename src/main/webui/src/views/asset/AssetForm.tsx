import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {FieldGroup} from "@/components/ui/field.tsx";
import {FormField} from "@/components/form-field.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {EntityComboBox} from "@/components/entity/entity-combobox.tsx";
import {PartnerListFunctions} from "@/views/partner/PartnerFunctions.ts";
import type {EntityFormProps} from "@/components/entity/entity-dialog.tsx";
import {type AssetDTO, type AssetDTOExpanded, AssetEndpointApi} from "@/generated";
import {useEffect} from "react";
import {useWorkspace} from "@/lib/workspace.tsx";
import {showError} from "@/lib/errors.tsx";
import i18next from "i18next";

export function AssetFormExpanded(props: EntityFormProps<AssetDTOExpanded>) {
    return (
        <AssetForm {...props}
                   entity={props.entity ? ({...props.entity, providerId: props.entity?.provider?.id}) : null}/>
    )
}

export function AssetForm(props: EntityFormProps<AssetDTO>) {
    const {header, footer, entity, onSubmit} = props;

    const formSchema = z.object({
        name: z.string().min(2).max(255),
        code: z.string().min(3).max(12),
        symbol: z.string().max(10),
        providerId: z.number().nullable(),
        notes: z.string().max(1024),
    })

    const defaultValues: z.infer<typeof formSchema> = {
        name: "",
        code: "",
        symbol: "",
        providerId: null,
        notes: "",
    }

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues
    })

    const {workspace} = useWorkspace()

    function submit(data: z.infer<typeof formSchema>) {
        if (!entity?.id) {
            new AssetEndpointApi().apiV2AssetPost({
                assetDTOWithoutId: {...data, providerId: data.providerId || undefined, workspaceId: workspace.id!}
            }).then(onSubmit).catch(showError)
        } else {
            new AssetEndpointApi().apiV2AssetPatch({
                assetDTOWithoutWorkspace: {...data, providerId: data.providerId || undefined, id: entity.id}
            }).then(onSubmit).catch(showError)
        }
    }

    useEffect(() => {
        form.reset(entity || defaultValues)
    }, [entity])

    return (
        <form onSubmit={form.handleSubmit(submit)}>
            {header}
            <FieldGroup>
                <div className={"flex gap-2"}>
                    <FormField fieldName={"name"}
                               control={form.control}
                               label={i18next.t("asset.name")}
                               Input={(props) => (
                                   <Input {...props} type={"text"} placeholder={i18next.t("asset.name.placeholder")}/>
                               )}/>
                    <FormField fieldName={"code"}
                               control={form.control}
                               label={i18next.t("asset.code")}
                               Input={(props) => (
                                   <Input {...props} type={"text"} placeholder={i18next.t("asset.code.placeholder")}/>
                               )}/>
                </div>
                <div className={"flex gap-2"}>
                    <FormField fieldName={"symbol"}
                               control={form.control}
                               label={i18next.t("asset.symbol")}
                               Input={(props) => (
                                   <Input {...props} value={props.value || ""} type={"text"}
                                          placeholder={i18next.t("asset.symbol.placeholder")}/>
                               )}/>
                    <FormField fieldName={"providerId"}
                               control={form.control}
                               label={i18next.t("asset.provider")}
                               Input={(props) => (
                                   <EntityComboBox {...props}
                                                   emptyLabel={i18next.t("asset.provider.placeholder")}
                                                   functions={PartnerListFunctions}
                                                   optional={true}/>
                               )}/>
                </div>
                <FormField fieldName={"notes"}
                           control={form.control}
                           label={i18next.t("asset.notes")}
                           Input={(props) => (
                               <Textarea {...props} value={props.value || ""} placeholder={i18next.t("asset.notes.placeholder")}/>
                           )}/>
            </FieldGroup>
            {footer}
        </form>
    )
}