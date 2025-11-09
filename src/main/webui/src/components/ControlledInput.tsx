import {Field, FieldError, FieldLabel} from "./ui/field.tsx";
import {Input} from "./ui/input.tsx";
import {type Control, Controller, type FieldPath, type FieldValues} from "react-hook-form";
import {Textarea} from "./ui/textarea.tsx";

export interface ControlledInputProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>, TTransformedValues = TFieldValues> {
    name: TName;
    control: Control<TFieldValues, any, TTransformedValues>
    label: string;
    placeholder?: string;
    type?: string;
}

export function ControlledInput<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>, TTransformedValues = TFieldValues>(props: ControlledInputProps<TFieldValues, TName, TTransformedValues>) {
    const {name, control, type, label, placeholder} = props;

    return (
        <Controller name={name} control={control} render={({field, fieldState}) => {
            return (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={name}>{label}</FieldLabel>
                    <Input {...field} id={name} type={type || "text"} aria-invalid={fieldState.invalid}
                           placeholder={placeholder}/>
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]}/>
                    )}
                </Field>
            )
        }}/>
    )
}

export function ControlledTextArea<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>, TTransformedValues = TFieldValues>(props: ControlledInputProps<TFieldValues, TName, TTransformedValues>) {
    const {name, control, label, placeholder} = props;

    return (
        <Controller name={name} control={control} render={({field, fieldState}) => {
            return (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={name}>{label}</FieldLabel>
                    <Textarea {...field} id={name} aria-invalid={fieldState.invalid}
                              placeholder={placeholder}/>
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]}/>
                    )}
                </Field>
            )
        }}/>
    )
}