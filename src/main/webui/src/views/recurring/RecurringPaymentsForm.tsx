import {type EntityFormProps, handleSubmit} from "@/components/entity/entity-dialog.tsx";
import {type RecurringPaymentDTO, RecurringPaymentStatus, TransactionType} from "@/generated";
import {useEffect, useState} from "react";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {FieldGroup} from "@/components/ui/field.tsx";
import i18next from "i18next";
import {Input} from "@/components/ui/input.tsx";
import {FormField} from "@/components/form-field.tsx";
import {DatePicker} from "@/components/date-picker.tsx";
import {Select} from "@/components/select.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {cronExpression, requireNullable} from "@/lib/zod.ts";
import {CronExpressionParser} from "cron-parser";
import {renderDateTime} from "@/components/data-table.tsx";
import {NumberField} from "@/components/numberfield.tsx";
import {EntityComboBox} from "@/components/entity/entity-combobox.tsx";
import {AssetFunctions} from "@/views/asset/AssetView.tsx";
import {WalletFunctions} from "@/views/wallet/WalletFunctions.ts";
import {PartnerFunctions} from "@/views/partner/PartnerFunctions.ts";
import {RecurringPaymentApi} from "@/views/recurring/RecurringPaymentFunctions.ts";
import {useWorkspace} from "@/lib/workspace.tsx";
import {Button} from "@/components/ui/button.tsx";
import {DialogFooter} from "@/components/ui/dialog.tsx";
import {AssetForm} from "@/views/asset/AssetForm.tsx";
import {WalletForm} from "@/views/wallet/WalletForm.tsx";
import {PartnerForm} from "@/views/partner/PartnerForm.tsx";
import {showError} from "@/lib/errors.tsx";

interface CoreData {
    name: string;
    cronSchedule: string;
    notBefore: Date | null;
    notAfter: Date | null;
    status: RecurringPaymentStatus;
    notes: string;
}

interface CoreDataFormProps extends EntityFormProps<RecurringPaymentDTO> {
    submit: (data: CoreData) => void;
}

function isValidCron(expr: string): boolean {
    try {
        CronExpressionParser.parse(expr, {strict: true});
        return true;
    } catch {
        return false;
    }
}

function CoreDataForm(props: CoreDataFormProps) {
    const formSchema = z.object({
        name: z.string().min(2).max(255),
        cronSchedule: cronExpression(),
        notBefore: z.date().nullable(),
        notAfter: z.date().nullable(),
        status: z.enum(RecurringPaymentStatus),
        notes: z.string().max(1024)
    })

    const defaultValues: z.input<typeof formSchema> = {
        name: "",
        cronSchedule: "0 0 0 * * 1-5",
        notBefore: null,
        notAfter: null,
        status: RecurringPaymentStatus.Active,
        notes: "",
    } satisfies CoreData

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues
    })

    useEffect(() => {
        form.reset(props.entity || defaultValues)
    }, [props.entity]);

    function submit(data: z.output<typeof formSchema>) {
        props.submit(data)
    }

    return (
        <form onSubmit={handleSubmit(form, submit)}>
            {props.header}

            <FieldGroup>
                <div className={"flex gap-2"}>
                    <FormField fieldName={"name"}
                               label={i18next.t("recurring.name")}
                               Input={(props) => (
                                   <Input {...props} placeholder={i18next.t("recurring.name.placeholder")}/>
                               )}
                               control={form.control}/>
                    <FormField fieldName={"status"}
                               label={i18next.t("recurring.status")}
                               Input={props => (<Select {...props} emptyLabel={""}
                                                        options={Object.values(RecurringPaymentStatus)}
                                                        keyGenerator={v => v}
                                                        render={v => i18next.t("RecurringPaymentStatus." + v)}/>)}
                               control={form.control}/>
                </div>

                <FormField fieldName={"cronSchedule"}
                           label={i18next.t("recurring.cronSchedule")}
                           Input={(props) => (
                               <div className={"flex gap-2 flex-col"}>
                                   <Input {...props} placeholder={i18next.t("recurring.cronSchedule.placeholder")}/>
                                   {isValidCron(props.value) && renderDateTime(CronExpressionParser.parse(props.value).next().toDate())}
                               </div>
                           )}
                           control={form.control}/>

                <div className={"gap-2 flex"}>
                    <FormField fieldName={"notBefore"}
                               label={i18next.t("recurring.notBefore")}
                               Input={props => (<DatePicker {...props}/>)}
                               control={form.control}/>
                    <FormField fieldName={"notAfter"}
                               label={i18next.t("recurring.notAfter")}
                               Input={props => (<DatePicker {...props}/>)}
                               control={form.control}/>
                </div>

                <FormField fieldName={"notes"}
                           label={i18next.t("recurring.notes")}
                           Input={props => (<Textarea {...props} value={props.value || ""}/>)}
                           control={form.control}/>
            </FieldGroup>

            <DialogFooter className={"mt-4"}>
                <Button variant={"outline"}
                        type={"reset"}
                        onClick={props.close}>{i18next.t("cancel")}</Button>
                <Button>{i18next.t("next")}</Button>
            </DialogFooter>
        </form>
    )
}

interface PaymentData {
    amount: number;
    assetId: number;
    walletId: number;
    partnerId: number | null;
}

interface PaymentDataFormProps extends EntityFormProps<RecurringPaymentDTO> {
    submit: (data: PaymentData) => void;
}

function PaymentDataForm(props: PaymentDataFormProps) {
    const formSchema = z.object({
        amount: z.number(),
        assetId: requireNullable(z.number()),
        walletId: requireNullable(z.number()),
        partnerId: z.number().nullable(),
    })

    const defaultValues: z.input<typeof formSchema> = {
        amount: 0,
        assetId: null,
        walletId: null,
        partnerId: null
    }

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues
    })

    useEffect(() => {
        form.reset(props.entity ? {
            ...props.entity,
            assetId: props.entity.asset!.id,
            walletId: props.entity.wallet!.id,
            partnerId: props.entity.partner?.id
        } : defaultValues)
    }, [props.entity]);

    function submit(data: z.output<typeof formSchema>) {
        props.submit(data)
    }

    return (
        <form onSubmit={handleSubmit(form, submit)}>
            {props.header}

            <FieldGroup>
                <div className={"flex gap-2"}>
                    <FormField fieldName={"amount"}
                               label={i18next.t("recurring.amount")}
                               Input={props => (<NumberField {...props}/>)}
                               control={form.control}/>
                    <FormField fieldName={"assetId"}
                               label={i18next.t("recurring.asset")}
                               Input={props => (
                                   <EntityComboBox {...props} functions={AssetFunctions}
                                                   optional={false}
                                                   i18nKey={"asset"}
                                                   Form={AssetForm}/>
                               )}
                               control={form.control}/>
                </div>
                <div className={"flex gap-2"}>
                    <FormField fieldName={"walletId"}
                               label={i18next.t("recurring.wallet")}
                               Input={props => (
                                   <EntityComboBox {...props} functions={WalletFunctions}
                                                   optional={false}
                                                   i18nKey={"wallet"}
                                                   Form={WalletForm}/>
                               )}
                               control={form.control}/>
                    <FormField fieldName={"partnerId"}
                               label={i18next.t("recurring.partner")}
                               Input={props => (
                                   <EntityComboBox {...props} functions={PartnerFunctions}
                                                   optional={true}
                                                   i18nKey={"partner"}
                                                   Form={PartnerForm}/>
                               )}
                               control={form.control}/>
                </div>
            </FieldGroup>

            <DialogFooter className={"mt-4"}>
                <Button variant={"outline"}
                        type={"reset"}
                        onClick={props.close}>{i18next.t("back")}</Button>
                <Button>{props.entity?.id ? i18next.t("save") : i18next.t("create")}</Button>
            </DialogFooter>
        </form>
    )
}

export function RecurringPaymentsForm(props: EntityFormProps<RecurringPaymentDTO>) {
    const [coreData, setCoreData] = useState<CoreData | undefined>(undefined)
    const [paymentData, setPaymentData] = useState<PaymentData | undefined>(undefined)

    const [page, setPage] = useState<number>(0)

    const {workspace} = useWorkspace()

    useEffect(() => {
        const updateRecurringPayment = async () => {
            if (!coreData || !paymentData || !props.entity?.id) return;

            const id = props.entity.id;
            const payload = {
                id,
                ...coreData,
                ...paymentData,
                type: TransactionType.Payment,
                notBefore: coreData.notBefore || undefined,
                notAfter: coreData.notAfter || undefined,
                partnerId: paymentData.partnerId || undefined
            };

            try {
                const result = await RecurringPaymentApi.apiV2RecurringPut({
                    recurringPaymentDTOWithoutWorkspace: payload
                });

                await RecurringPaymentApi.apiV2RecurringIdUpdatePaymentsPost({id});

                props.onSubmit?.(result);
            } catch (error) {
                showError(error);
            }
        };

        if (coreData && paymentData) {
            if (props.entity?.id) {
                updateRecurringPayment().catch(showError);
            } else {
                RecurringPaymentApi.apiV2RecurringPost({
                    recurringPaymentDTOWithoutId: {
                        ...coreData,
                        ...paymentData,
                        type: TransactionType.Payment,
                        notBefore: coreData.notBefore || undefined,
                        notAfter: coreData.notAfter || undefined,
                        partnerId: paymentData.partnerId || undefined,
                        workspaceId: workspace.id!
                    }
                }).then(props.onSubmit).catch(showError)
            }
        }
    }, [coreData, paymentData]);

    return (
        <>
            {page === 0 && (<CoreDataForm submit={d => {
                setCoreData(d)
                setPage(1)
            }} {...props}/>)}
            {(page === 1 && coreData) && (
                <PaymentDataForm {...props} submit={setPaymentData} close={() => setPage(page - 1)}/>)}
        </>
    )
}