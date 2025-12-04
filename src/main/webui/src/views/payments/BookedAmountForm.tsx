import {type EntityFormProps, handleSubmit} from "@/components/entity/entity-dialog.tsx";
import type {BookedAmountDTO, TransactionDTOExpanded} from "@/generated";
import {z} from "zod";
import {requireNullable} from "@/lib/zod.ts";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {FieldGroup} from "@/components/ui/field.tsx";
import {FormField} from "@/components/form-field.tsx";
import i18next from "i18next";
import {DatePicker} from "@/components/date-picker.tsx";
import {EntityComboBox} from "@/components/entity/entity-combobox.tsx";
import {WalletFunctions} from "@/views/wallet/WalletFunctions.ts";
import {NumberField} from "@/components/numberfield.tsx";
import {AssetFunctions} from "@/views/asset/AssetView.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {useEffect} from "react";
import {BookedAmountAPI} from "@/views/payments/BookedAmountFunctions.ts";
import {showError} from "@/lib/errors.tsx";

export interface BookedAmountFormProps extends EntityFormProps<BookedAmountDTO> {
    transaction: TransactionDTOExpanded
}

export function BookedAmountForm(props: BookedAmountFormProps) {
    const {header, footer, entity, transaction, onSubmit} = props;

    const formSchema = z.object({
        date: z.date(),
        amount: z.number(),
        assetId: requireNullable(z.number()),
        walletId: requireNullable(z.number()),
        notes: z.string().max(1024),
    })

    const defaultValues: z.input<typeof formSchema> = {
        date: transaction.date || new Date(),
        amount: transaction.amount || 0,
        assetId: transaction.asset?.id || null,
        walletId: transaction.wallet?.id || null,
        notes: "",
    }

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues,
    })

    useEffect(() => {
        form.reset(entity || defaultValues)
    }, [entity])

    function submit(data: z.infer<typeof formSchema>) {
        if (entity?.id) {
            BookedAmountAPI.apiV2BookedamountPatch({
                bookedAmountDTOWithoutTransaction: {...data, id: entity.id},
            }).then(onSubmit).catch(showError)
        } else {
            BookedAmountAPI.apiV2BookedamountTransactionTransactionIdPost({
                bookedAmountDTOWithoutIdAndTransaction: {...data},
                transactionId: transaction.id!,
            }).then(onSubmit).catch(showError)
        }
    }

    return (
        <form onSubmit={handleSubmit(form, submit)}>
            {header}
            <FieldGroup>
                <div className={"flex gap-2"}>
                    <FormField fieldName={"date"}
                               label={i18next.t("booked.date")}
                               Input={(props) => (
                                   <DatePicker {...props}/>
                               )}
                               control={form.control}/>
                    <FormField fieldName={"walletId"}
                               label={i18next.t("booked.wallet")}
                               Input={(props) => (
                                   <EntityComboBox {...props}
                                                   optional={false}
                                                   functions={WalletFunctions}/>
                               )}
                               control={form.control}/>
                </div>
                <div className={"flex gap-2"}>
                    <FormField fieldName={"amount"}
                               label={i18next.t("booked.amount")}
                               Input={(props) => (
                                   <NumberField {...props}/>
                               )}
                               control={form.control}/>
                    <FormField fieldName={"assetId"}
                               label={i18next.t("booked.asset")}
                               Input={(props) => (
                                   <EntityComboBox {...props}
                                                   optional={false}
                                                   functions={AssetFunctions}/>
                               )}
                               control={form.control}/>
                </div>
                <FormField fieldName={"notes"}
                           label={i18next.t("booked.notes")}
                           Input={(props) => (
                               <Textarea {...props}/>
                           )}
                           control={form.control}/>
            </FieldGroup>
            {footer}
        </form>
    )
}