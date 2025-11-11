import {Field, FieldError, FieldLabel} from "./ui/field.tsx";
import {Input} from "./ui/input.tsx";
import {type Control, Controller, type FieldPath, type FieldValues} from "react-hook-form";
import {Textarea} from "./ui/textarea.tsx";
import {Select} from "./select.tsx";
import {ComboBox} from "./combobox.tsx";
import {EntityComboBox} from "./entity-combobox.tsx";
import type {EntityActions, EntityEditForm} from "../views/data/EntityDialog.tsx";
import type {HTMLInputTypeAttribute} from "react";

export interface ControlledInputProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>, TTransformedValues = TFieldValues> {
    name: TName;
    control: Control<TFieldValues, any, TTransformedValues>
    label: string;
    placeholder?: string;
    type?: HTMLInputTypeAttribute;
}

export interface ControlledSelectProps<TOption, TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>, TTransformedValues = TFieldValues> {
    name: TName
    control: Control<TFieldValues, any, TTransformedValues>
    label: string
    placeholder?: string
    optional?: boolean,
    options: TOption[]
    render: (value: TOption) => string
    keyGenerator: (value: TOption) => string
}

export function ControlledSelect<TOption, TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>, TTransformedValues = TFieldValues>(props: ControlledSelectProps<TOption, TFieldValues, TName, TTransformedValues>) {
    const {name, control, label, placeholder, optional, options, render, keyGenerator} = props;

    return (
        <Controller name={name} control={control} render={({field, fieldState}) => {
            return (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={name}>{label}</FieldLabel>
                    <Select emptyLabel={placeholder || ""}
                            onChange={field.onChange}
                            value={field.value}
                            options={options}
                            optional={optional}
                            render={render}
                            keyGenerator={keyGenerator}/>
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]}/>
                    )}
                </Field>
            )
        }}/>
    )
}

export function ControlledComboBox<TOption, TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>, TTransformedValues = TFieldValues>(props: ControlledSelectProps<TOption, TFieldValues, TName, TTransformedValues>) {
    const {name, control, label, placeholder, optional, options, render, keyGenerator} = props;

    return (
        <Controller name={name} control={control} render={({field, fieldState}) => {
            return (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={name}>{label}</FieldLabel>
                    <ComboBox emptyLabel={placeholder || ""}
                              onChange={field.onChange}
                              value={field.value}
                              options={options}
                              optional={optional}
                              render={render}
                              keyGenerator={keyGenerator}/>
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]}/>
                    )}
                </Field>
            )
        }}/>
    )
}

export interface ControlledEntityComboBoxProps<TEntity, TForm extends FieldValues, TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>, TTransformedValues = TFieldValues> {
    name: TName,
    control: Control<TFieldValues, any, TTransformedValues>,
    label: string,
    placeholder?: string,
    optional?: boolean,
    render: (value: TEntity) => string,
    keyGenerator: (value: TEntity) => string,
    actions: EntityActions<TEntity>,
    form: EntityEditForm<TEntity, TForm>,
    i18nKey: string,
}

export function ControlledEntityComboBox<TOption, TForm extends FieldValues, TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>, TTransformedValues = TFieldValues>(props: ControlledEntityComboBoxProps<TOption, TForm, TFieldValues, TName, TTransformedValues>) {
    const {name, control, label, placeholder, optional, render, keyGenerator, actions, form, i18nKey} = props;

    return (
        <Controller name={name} control={control} render={({field, fieldState}) => {
            return (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={name}>{label}</FieldLabel>
                    <EntityComboBox emptyLabel={placeholder || ""}
                                    onChange={field.onChange}
                                    value={field.value}
                                    optional={optional}
                                    render={render}
                                    actions={actions}
                                    form={form}
                                    i18nKey={i18nKey}
                                    keyGenerator={keyGenerator}/>
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]}/>
                    )}
                </Field>
            )
        }}/>
    )
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

export function ControlledNumberInput<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>, TTransformedValues = TFieldValues>(props: ControlledInputProps<TFieldValues, TName, TTransformedValues>) {
    const {name, control, label, placeholder} = props;

    function convertToString(value: number | string) {
        if (typeof value === 'string') {
            return value;
        }
        return value.toLocaleString();
    }

    function convertToNumber(value: string) {
        return parseFloat(value);
    }

    return (
        <Controller name={name} control={control} render={({field, fieldState}) => {
            return (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={name}>{label}</FieldLabel>
                    <Input {...field} id={name}
                           value={convertToString(field.value)}
                           onChange={(event) => field.onChange(convertToNumber(event.target.value))}
                           type={"number"}
                           aria-invalid={fieldState.invalid}
                           placeholder={placeholder}/>
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]}/>
                    )}
                </Field>
            )
        }}/>
    )
}

export function ControlledDateInput<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>, TTransformedValues = TFieldValues>(props: ControlledInputProps<TFieldValues, TName, TTransformedValues>) {
    const {name, control, label, placeholder} = props;

    function convertToString(value: Date | string) {
        if (typeof value === 'string') {
            return value;
        }
        return value.toLocaleDateString("sv", {year: "numeric", month: "2-digit", day: "2-digit"});
    }

    function convertToDate(value: string) {
        const parts = value.split("-");
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }

    return (
        <Controller name={name} control={control} render={({field, fieldState}) => {
            return (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={name}>{label}</FieldLabel>
                    <Input {...field} id={name}
                           value={convertToString(field.value)}
                           onChange={(event) => field.onChange(convertToDate(event.target.value))}
                           type={"date"}
                           aria-invalid={fieldState.invalid}
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