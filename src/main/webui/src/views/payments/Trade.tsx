import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "../../components/ui/dialog.tsx";
import {z} from "zod";
import {type Transaction, TransactionStatus, TransactionType, type Workspace} from "../../lib/types.ts";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {
    ControlledDateInput,
    ControlledEntityComboBox,
    ControlledInput, ControlledNumberInput, ControlledSelect,
    ControlledTextArea
} from "../../components/ControlledInput.tsx";
import {Button} from "../../components/ui/button.tsx";
import {useEffect, useState} from "react";
import {PartnerActions, usePartnerEditForm} from "../partners/PartnerView.tsx";
import {InputMode} from "../../components/numberfield.tsx";
import {AssetActions, useAssetEditForm} from "../assets/AssetView.tsx";
import {useWalletForm, WalletActions} from "../WalletView.tsx";
import i18next from "i18next";
import {useWorkspace} from "../../lib/workspace.tsx";
import {patch, post} from "../../lib/api.ts";
import {showHttpErrorAndContinue} from "../../lib/errors.tsx";

interface FormProps<TValue> {
    value: TValue | null,
    next: (value: TValue) => void,
    previous: () => void,
}

const defaultSideValues = {
    date: new Date(),
    amount: 0,
    asset: undefined,
    wallet: undefined,
    partner: null,
    status: TransactionStatus.OPEN
}

const defaultValues = {
    name: "",
    sideA: defaultSideValues,
    sideB: defaultSideValues,
    notes: null,
}

const sideSchema = z.object({
    date: z.date(),
    amount: z.number(),
    asset: z.any(),
    wallet: z.any(),
    partner: z.any().nullable(),
    status: z.enum(TransactionStatus)
})
const formSchema = z.object({
    name: z.string().min(3).max(255),
    notes: z.string().nullable()
})

function GeneralForm(props: FormProps<z.infer<typeof formSchema>>) {
    const {next, previous, value} = props;

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    useEffect(() => {
        form.reset(value || defaultValues)
    }, [value])

    function onSubmit(data: z.infer<typeof formSchema>) {
        next(data)
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className={"flex flex-col gap-3"}>
            <DialogHeader>
                <DialogTitle>Create trade</DialogTitle>
                <DialogDescription>Fill in some general details for both transactions</DialogDescription>
            </DialogHeader>

            <div className={"flex flex-col gap-3"}>
                <ControlledInput name={"name"} control={form.control} label={"Name"}/>
                <ControlledTextArea name={"notes"} control={form.control} label={"Notes"}/>
            </div>

            <DialogFooter>
                <Button onClick={previous} type={"reset"} variant={"secondary"}>Cancel</Button>
                <Button>Next</Button>
            </DialogFooter>
        </form>
    )
}

interface SideFormProps extends FormProps<z.infer<typeof sideSchema>> {
    side: "a" | "b"
}

function SideForm(props: SideFormProps) {
    const {next, previous, side, value} = props;

    const form = useForm({
        resolver: zodResolver(sideSchema),
        defaultValues: defaultSideValues,
    })

    useEffect(() => {
        form.reset(value || defaultSideValues)
    }, [])

    function onSubmit(data: z.infer<typeof sideSchema>) {
        next(data)
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className={"flex flex-col gap-3"}>
            <DialogHeader>
                <DialogTitle>{side === "a" ? "Create Offer" : "Create Bid"}</DialogTitle>
                <DialogDescription>{side === "a" ? "Input the offer side of the trade" : "Input the bid side of the trade"}</DialogDescription>
            </DialogHeader>

            <div className={"flex flex-col gap-3"}>
                <div className={"flex gap-2"}>
                    <ControlledDateInput name={"date"}
                                         control={form.control}
                                         label={"Date"}/>
                    <ControlledEntityComboBox name={"wallet"}
                                              control={form.control}
                                              label={"Wallet"}
                                              render={WalletActions.format}
                                              keyGenerator={w => w.name}
                                              actions={WalletActions}
                                              form={useWalletForm()}
                                              i18nKey={"Wallet"}/>
                </div>
                <div className={"flex gap-2"}>
                    <ControlledNumberInput name={"amount"}
                                           mode={side === "a" ? InputMode.NEGATIVE : InputMode.POSITIVE}
                                           control={form.control}
                                           label={"Amount"}/>
                    <ControlledEntityComboBox name={"asset"}
                                              control={form.control}
                                              label={"Asset"}
                                              render={AssetActions.format}
                                              keyGenerator={a => a.name}
                                              actions={AssetActions}
                                              form={useAssetEditForm()}
                                              i18nKey={"Asset"}/>
                </div>
                <div className={"flex gap-2"}>
                    <ControlledEntityComboBox name={"partner"}
                                              control={form.control}
                                              label={"Partner"}
                                              render={PartnerActions.format}
                                              keyGenerator={p => p.name}
                                              actions={PartnerActions}
                                              form={usePartnerEditForm()}
                                              optional={true}
                                              i18nKey={"Partner"}/>
                    <ControlledSelect name={"status"}
                                      control={form.control}
                                      label={"Status"}
                                      options={Object.keys(TransactionStatus)}
                                      render={s => i18next.t("TransactionStatus." + s)}
                                      keyGenerator={s => s}/>
                </div>
            </div>

            <DialogFooter>
                <Button onClick={previous} type={"reset"} variant={"secondary"}>Back</Button>
                <Button>{side === "a" ? "Next" : "Create"}</Button>
            </DialogFooter>
        </form>
    )
}

function toTransaction(general: z.infer<typeof formSchema>,
                       additional: z.infer<typeof sideSchema>,
                       workspace: Workspace): Transaction {
    return {
        ...general,
        ...additional,
        date: additional.date.toISOString(),
        workspace: workspace,
        bookedAmounts: [],
        type: TransactionType.PAYMENT,
        internalRef: null
    }
}

export interface TradeDialogProps {
    open: boolean,
    setOpen: (open: boolean) => void,
    onCreate: () => void,
}

export function TradeDialog(props: TradeDialogProps) {
    const {open, setOpen, onCreate} = props;

    const {workspace} = useWorkspace();

    const [generalInfo, setGeneralInfo] = useState<z.infer<typeof formSchema> | null>(null)
    const [sideA, setSideA] = useState<z.infer<typeof sideSchema> | null>(null)
    const [sideB, setSideB] = useState<z.infer<typeof sideSchema> | null>(null)
    const [form, setForm] = useState<number>(0)

    function next<TValue>(fn: (value: TValue) => void): ((v: TValue) => void) {
        return (val) => {
            fn(val)
            setForm(form + 1)
        }
    }

    useEffect(() => {
        if (form === 3) {
            const transactionA: Transaction = toTransaction(generalInfo!, sideA!, workspace)
            const transactionB: Transaction = toTransaction(generalInfo!, sideB!, workspace)

            const promiseA = post("/api/v1/transaction", transactionA).then(showHttpErrorAndContinue)
            const promiseB = post("/api/v1/transaction", transactionB).then(showHttpErrorAndContinue)

            Promise.all([promiseA, promiseB]).then(async ([resultA, resultB]) => {
                if (!resultA.ok || !resultB.ok) {
                    return
                }

                const a = await resultA.json()
                const b = await resultB.json()

                patch("/api/v1/transaction/link", {firstId: a.id, secondId: b.id})
                    .then(showHttpErrorAndContinue)
                    .then(response => {
                        if (response.ok) {
                            onCreate()
                        }
                    })
            })

            setOpen(false);
        }
    }, [form])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                {form === 0 && (
                    <GeneralForm value={generalInfo}
                                 next={next(setGeneralInfo)}
                                 previous={() => setOpen(false)}/>
                )}
                {form === 1 && (
                    <SideForm value={sideA}
                              next={next(setSideA)}
                              previous={() => setForm(form - 1)}
                              side={"a"}/>
                )}
                {form === 2 && (
                    <SideForm value={sideB}
                              next={next(setSideB)}
                              previous={() => setForm(form - 1)}
                              side={"b"}/>
                )}
            </DialogContent>
        </Dialog>
    )
}
