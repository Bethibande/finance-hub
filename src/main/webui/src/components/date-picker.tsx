import {Input} from "@/components/ui/input.tsx";
import {useState} from "react";

export interface DatePickerProps {
    value: Date | null;
    onChange: (date: Date | null) => void;
}

function toString(date: Date | null) {
    if (date == null) return toString(new Date())
    return date.toLocaleDateString("sv", {year: "numeric", month: "2-digit", day: "2-digit"})
}

function isValidDate(date: Date | undefined) {
    if (!date) {
        return false
    }
    return !isNaN(date.getTime())
}

export function DatePicker(props: DatePickerProps) {
    const [value, setValue] = useState<string>(toString(props.value))

    return (
        <Input id={"date"}
               value={value}
               type={"date"}
               className={"bg-background"}
        onChange={(e) => {
            const date = new Date(e.target.value);
            setValue(e.target.value);

            if (isValidDate(date)) {
                props.onChange(date);
            }
        }}/>
    )
}