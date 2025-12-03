import {type EntityFormProps, handleSubmit} from "@/components/entity/entity-dialog.tsx";
import type {WalletDTO, WalletDTOExpanded} from "@/generated";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {WalletAPI} from "@/views/wallet/WalletFunctions.ts";
import {showError} from "@/lib/errors.tsx";
import {useWorkspace} from "@/lib/workspace.tsx";
import {FieldGroup} from "@/components/ui/field.tsx";
import {FormField} from "@/components/form-field.tsx";
import i18next from "i18next";
import {Input} from "@/components/ui/input.tsx";
import {EntityComboBox} from "@/components/entity/entity-combobox.tsx";
import {AssetFunctions} from "@/views/asset/AssetView.tsx";
import {PartnerFunctions} from "@/views/partner/PartnerFunctions.ts";
import {Textarea} from "@/components/ui/textarea.tsx";
import {useEffect} from "react";

export function WalletFormExpanded(props: EntityFormProps<WalletDTOExpanded>) {
    return (
        <WalletForm {...props} entity={props.entity ? ({...props.entity, assetId: props.entity.asset?.id, providerId: props.entity.provider?.id}) : null}/>
    )
}

export function WalletForm(props: EntityFormProps<WalletDTO>) {
    const { header, footer, entity, onSubmit } = props;

    const formSchema = z.object({
        name: z.string().min(3).max(255),
        providerId: z.number().nullable(),
        assetId: z.number().nullable(),
        notes: z.string().max(1024),
    })

    const defaultValues: z.infer<typeof formSchema> = {
        name: "",
        providerId: null,
        assetId: null,
        notes: ""
    }

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues
    });

    useEffect(() => {
        form.reset(entity || defaultValues)
    }, [entity])

    const {workspace} = useWorkspace();
    function submit(data: z.infer<typeof formSchema>) {
        if (entity?.id) {
            WalletAPI.apiV2WalletPatch({
                walletDTOWithoutWorkspace: {
                    ...data,
                    assetId: data.assetId || undefined,
                    providerId: data.providerId || undefined,
                    id: entity.id
                }
            }).then(onSubmit).catch(showError)
        } else {
            WalletAPI.apiV2WalletPost({
                walletDTOWithoutId: {
                    ...data,
                    assetId: data.assetId || undefined,
                    providerId: data.providerId || undefined,
                    workspaceId: workspace.id!
                }
            }).then(onSubmit).catch(showError)
        }
    }

    return (
        <form onSubmit={handleSubmit(form, submit)}>
            {header}
            <FieldGroup>
                <FormField fieldName={"name"}
                           label={i18next.t("wallet.name")}
                           Input={(props) => (
                               <Input {...props} placeholder={i18next.t("wallet.name.placeholder")}/>
                           )}
                           control={form.control}/>
                <div className={"flex gap-2"}>
                    <FormField fieldName={"assetId"}
                               label={i18next.t("wallet.asset")}
                               Input={(props) => (
                                   <EntityComboBox {...props} functions={AssetFunctions} optional={true}/>
                               )}
                               control={form.control}/>
                    <FormField fieldName={"providerId"}
                               label={i18next.t("wallet.provider")}
                               Input={(props) => (
                                   <EntityComboBox {...props} functions={PartnerFunctions} optional={true}/>
                               )}
                               control={form.control}/>
                </div>
                <FormField fieldName={"notes"}
                           label={i18next.t("wallet.notes")}
                           Input={(props) => (
                               <Textarea {...props} placeholder={i18next.t("wallet.notes.placeholder")}/>
                           )}
                           control={form.control}/>
            </FieldGroup>
            {footer}
        </form>
    )
}