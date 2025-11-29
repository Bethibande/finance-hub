import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {FieldGroup} from "@/components/ui/field.tsx";
import {FormField} from "@/components/form-field.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {EntityComboBox} from "@/components/entity/entity-combobox.tsx";
import {PartnerListFunctions} from "@/views/partner/PartnerFunctions.ts";
import type {ReactNode} from "react";

export interface AssetFormProps {
    header?: ReactNode,
    footer?: ReactNode,
}

export function AssetForm(props: AssetFormProps) {
    const {header, footer} = props;

    const formSchema = z.object({
        name: z.string().min(2).max(255),
        code: z.string().min(3).max(12),
        symbol: z.string().min(1).max(10).nullable(),
        providerId: z.number().nullable(),
        notes: z.string().min(1).max(1024).nullable(),
    })

    const defaultValues: z.infer<typeof formSchema> = {
        name: "",
        code: "",
        symbol: null,
        providerId: null,
        notes: null,
    }

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues
    })

    function onSubmit(data: z.infer<typeof formSchema>) {
        console.log(data)
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            {header}
            <FieldGroup>
                <div className={"flex gap-2"}>
                    <FormField fieldName={"name"}
                               control={form.control}
                               label={"Name"}
                               Input={(props) => (
                                   <Input {...props} type={"text"} placeholder={"Name"}/>
                               )}/>
                    <FormField fieldName={"code"}
                               control={form.control}
                               label={"Code"}
                               Input={(props) => (
                                   <Input {...props} type={"text"} placeholder={"Name"}/>
                               )}/>
                </div>
                <div className={"flex gap-2"}>
                    <FormField fieldName={"symbol"}
                               control={form.control}
                               label={"Symbol"}
                               Input={(props) => (
                                   <Input {...props} value={props.value || ""} type={"text"} placeholder={"Name"}/>
                               )}/>
                    <FormField fieldName={"providerId"}
                               control={form.control}
                               label={"Symbol"}
                               Input={(props) => (
                                   <EntityComboBox {...props}
                                                   functions={PartnerListFunctions}
                                                   optional={true}/>
                               )}/>
                </div>
                <FormField fieldName={"notes"}
                           control={form.control}
                           label={"Notes"}
                           Input={(props) => (
                               <Textarea {...props} value={props.value || ""} placeholder={"Name"}/>
                           )}/>
            </FieldGroup>
            {footer}
        </form>
    )
}