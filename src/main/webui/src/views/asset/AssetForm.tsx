import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {FieldGroup} from "@/components/ui/field.tsx";
import {FormField} from "@/components/form-field.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";

export function AssetForm() {
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
            <FieldGroup>
                <FormField fieldName={"name"}
                           control={form.control}
                           label={"Name"}
                           Input={(props) => (
                               <Input {...props} type={"text"} placeholder={"Name"}/>
                           )}/>
            </FieldGroup>
            <Button type={"submit"}>Test</Button>
        </form>
    )
}