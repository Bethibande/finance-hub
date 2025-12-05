import {type EntityFormProps, handleSubmit} from "@/components/entity/entity-dialog.tsx";
import {
    type TransactionDTOExpanded,
    type TransactionDTOWithoutBookedAmounts,
    TransactionStatus,
    TransactionType
} from "@/generated";
import {z} from "zod";
import {requireNullable} from "@/lib/zod.ts";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {FieldGroup} from "@/components/ui/field.tsx";
import {FormField} from "@/components/form-field.tsx";
import i18next from "i18next";
import {Input} from "@/components/ui/input.tsx";
import {DatePicker} from "@/components/date-picker.tsx";
import {useEffect} from "react";
import {NumberField} from "@/components/numberfield.tsx";
import {EntityComboBox} from "@/components/entity/entity-combobox.tsx";
import {AssetFunctions} from "@/views/asset/AssetView.tsx";
import {AssetForm} from "@/views/asset/AssetForm.tsx";
import {WalletFunctions} from "@/views/wallet/WalletFunctions.ts";
import {WalletForm} from "@/views/wallet/WalletForm.tsx";
import {PartnerFunctions} from "@/views/partner/PartnerFunctions.ts";
import {PartnerForm} from "@/views/partner/PartnerForm.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {TransactionAPI} from "@/views/payments/TransactionFunctions.ts";
import {showError} from "@/lib/errors.tsx";
import {useWorkspace} from "@/lib/workspace.tsx";

export function TransactionFormExpanded(props: EntityFormProps<TransactionDTOExpanded>) {
    const {entity} = props;
    return (
        <TransactionForm {...props} entity={entity ? {
            ...entity,
            assetId: entity.asset!.id!,
            walletId: entity.wallet!.id!,
            partnerId: entity.partner?.id
        } : null}/>
    )
}

export function TransactionForm(props: EntityFormProps<TransactionDTOWithoutBookedAmounts>) {
    const {header, footer, entity, onSubmit} = props;

    const formSchema = z.object({
        name: z.string().min(3).max(255),
        date: z.date(),
        amount: z.number(),
        assetId: requireNullable(z.number()),
        walletId: requireNullable(z.number()),
        partnerId: z.number().nullable(),
        notes: z.string().max(1024)
    })

    const defaultValues: z.input<typeof formSchema> = {
        name: "",
        amount: 0,
        assetId: null,
        date: new Date(),
        walletId: null,
        partnerId: null,
        notes: ""
    }

    useEffect(() => {
        form.reset(entity || defaultValues)
    }, [entity]);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues,
    })

    const {workspace} = useWorkspace();

    function submit(data: z.output<typeof formSchema>) {
        if (entity?.id) {
            TransactionAPI.apiV2TransactionPatch({
                transactionDTOWithoutWorkspaceAndBookedAmounts: {
                    ...entity,
                    ...data,
                    partnerId: data.partnerId || undefined,
                }
            }).then(onSubmit).catch(showError)
        } else {
            TransactionAPI.apiV2TransactionPost({
                transactionDTOWithoutIdAndBookedAmounts: {
                    ...data,
                    partnerId: data.partnerId || undefined,
                    status: TransactionStatus.Open,
                    type: TransactionType.Payment,
                    workspaceId: workspace.id!,
                }
            }).then(onSubmit).catch(showError)
        }
    }

    return (
        <form onSubmit={handleSubmit(form, submit)}>
            {header}
            <FieldGroup>
                <div className={"flex gap-2"}>
                    <FormField fieldName={"name"}
                               label={i18next.t("transaction.name")}
                               Input={(props) => (
                                   <Input {...props} placeholder={i18next.t("transaction.name.placeholder")}/>
                               )}
                               control={form.control}/>
                    <FormField fieldName={"date"}
                               label={i18next.t("transaction.date")}
                               Input={(props) => (
                                   <DatePicker {...props} />
                               )}
                               control={form.control}/>
                </div>
                <div className={"flex gap-2"}>
                    <FormField fieldName={"amount"}
                               label={i18next.t("transaction.amount")}
                               Input={(props) => (
                                   <NumberField {...props} placeholder={i18next.t("transaction.amount.placeholder")}/>
                               )}
                               control={form.control}/>
                    <FormField fieldName={"assetId"}
                               label={i18next.t("transaction.asset")}
                               Input={(props) => (
                                   <EntityComboBox {...props}
                                                   optional={false}
                                                   functions={AssetFunctions}
                                                   i18nKey={"asset"}
                                                   Form={AssetForm}/>
                               )}
                               control={form.control}/>
                </div>
                <div className={"flex gap-2"}>
                    <FormField fieldName={"walletId"}
                               label={i18next.t("transaction.wallet")}
                               Input={(props) => (
                                   <EntityComboBox {...props}
                                                   optional={false}
                                                   functions={WalletFunctions}
                                                   i18nKey={"wallet"}
                                                   Form={WalletForm}/>
                               )}
                               control={form.control}/>
                    <FormField fieldName={"partnerId"}
                               label={i18next.t("transaction.partner")}
                               Input={(props) => (
                                   <EntityComboBox {...props}
                                                   optional={true}
                                                   functions={PartnerFunctions}
                                                   i18nKey={"partner"}
                                                   Form={PartnerForm}/>
                               )}
                               control={form.control}/>
                </div>
                <FormField fieldName={"notes"}
                           label={i18next.t("transaction.notes")}
                           Input={(props) => (
                               <Textarea {...props} placeholder={i18next.t("transaction.notes.placeholder")}/>
                           )}
                           control={form.control}/>
            </FieldGroup>
            {footer}
        </form>
    )
}