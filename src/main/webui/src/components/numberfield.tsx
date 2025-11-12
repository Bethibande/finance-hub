import * as React from "react";
import {type ComponentProps, type KeyboardEvent, useLayoutEffect, useRef, useState} from "react";
import {Input} from "./ui/input.tsx";
import {cn} from "../lib/utils.ts";

export const InputMode = {
    POSITIVE: "POSITIVE",
    NEGATIVE: "NEGATIVE",
} as const;

export type InputMode = typeof InputMode[keyof typeof InputMode];

export interface NumberFieldProps extends ComponentProps<"input"> {
    value: number;
    setValue: (value: number) => void;
    mode?: InputMode;
    decimals?: number
}

function extractSeparators(fn: (n: number) => string) {
    const str = fn(1_000.01)
    return {thousandsSeparator: str.charAt(1), decimalSeparator: str.charAt(5)};
}

export function NumberField(props: NumberFieldProps) {
    const {mode, decimals} = props;

    const [value, setValue] = useState(props.value);

    const element = useRef<HTMLInputElement>(null)
    const selection = useRef<number>(0)

    const {thousandsSeparator, decimalSeparator} = extractSeparators(toString);

    function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === '-') {
            e.preventDefault();

            const canNegate = !mode || ((value >= 0 && mode === InputMode.NEGATIVE) || (value < 0 && mode === InputMode.NEGATIVE))
            if (canNegate) {
                setValue(value * -1)

                if (element.current) {
                    const selectionMove = toString(value * -1).startsWith("-") ? 1 : -1;
                    const newSelection = (element.current.selectionStart || 0) + selectionMove;

                    selection.current = newSelection;
                    element.current.selectionStart = newSelection;
                    element.current.selectionEnd = newSelection;
                }
            }
        }
        if (e.key === "t") {
            e.preventDefault();
            setValue(value * 1000)
        }

        if (e.key === "Backspace") {
            const value = e.currentTarget.value
            const position = (e.currentTarget.selectionStart || 1) - 1
            const char = value.charAt(position)

            if (position >= value.length - 2) {
                e.preventDefault()

                const newValue = value.substring(0, position) + "0" + value.substring(position + 1, value.length)
                setValue(toNumber(cleanString(newValue)))
                e.currentTarget.selectionStart = position;
                e.currentTarget.selectionEnd = position;
            }

            if (char === decimalSeparator || char === thousandsSeparator) {
                e.preventDefault();
                e.currentTarget.selectionStart = position;
                e.currentTarget.selectionEnd = position;
            }
        }

        if (element.current) {
            selection.current = element.current.selectionStart || 0
        }
    }

    function cleanString(str: string): string {
        return str.replace(new RegExp("[^0-9" + decimalSeparator + "-]", "g"), "")
    }

    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        const cleanedInput = cleanString(e.target.value)
        const num = toNumber(cleanedInput);

        if (!cleanedInput || cleanedInput.length === 0 || isNaN(num)) {
            setValue(0.0)
            return;
        }

        if (element.current) {
            selection.current = element.current.selectionStart || 0
        }
        setValue(num)
    }

    function toNumber(str: string): number {
        return parseFloat(str);
    }

    function toString(value: number): string {
        return value.toLocaleString(undefined, {
            maximumFractionDigits: decimals || 2,
            minimumFractionDigits: decimals || 2,
            useGrouping: true,
        })
    }

    const isNegative = value < 0
    const stringValue = toString(value)

    useLayoutEffect(() => {
        if (element.current) {
            element.current.selectionStart = selection.current
            element.current.selectionEnd = selection.current
        }
    }, [value])

    return (
        <Input type={"text"}
               ref={element}
               inputMode={"decimal"}
               autoComplete={"off"}
               onKeyDown={onKeyDown}
               onChange={onChange}
               onBlur={() => props.setValue(value)}
               value={stringValue}
               className={cn("text-right", isNegative && "text-red-600")}/>
    )
}