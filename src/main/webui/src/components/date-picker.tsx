import {Input} from "@/components/ui/input.tsx";
import {useEffect, useState} from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Calendar} from "@/components/ui/calendar.tsx";
import {Calendar as CalendarIcon} from "react-bootstrap-icons";
import {convertDateToUTC} from "@/lib/utils.ts";

export interface DatePickerProps {
    value: Date | null;
    onChange: (date: Date | null) => void;
}

function toString(date: Date | undefined) {
    if (date == undefined) return toString(new Date())
    return date.toLocaleDateString("sv", {year: "numeric", month: "2-digit", day: "2-digit"})
}

function isValidDate(date: Date | undefined) {
    if (!date) {
        return false
    }
    return !isNaN(date.getTime())
}

export function DatePicker(props: DatePickerProps) {
    const date = props.value || new Date();

    const [value, setValue] = useState<string>(toString(date))
    const [open, setOpen] = useState<boolean>(false)
    const [month, setMonth] = useState<Date>(date)

    useEffect(() => {
        setValue(toString(date))
        setMonth(date)
    }, [props.value])

    return (
        <div className={"relative flex gap-2"}>
            <Input id={"date"}
                   value={value}
                   type={"date"}
                   className={"bg-background pr-10"}
                   onChange={(e) => {
                       const date = new Date(e.target.value);
                       setValue(e.target.value);

                       if (isValidDate(date)) {
                           props.onChange(convertDateToUTC(date));
                       }
                   }}/>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="date-picker"
                        variant="ghost"
                        className="absolute top-1/2 right-2 size-6 -translate-y-1/2">
                        <CalendarIcon className="size-3.5"/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="end"
                    alignOffset={-8}
                    sideOffset={10}>
                    <Calendar
                        mode="single"
                        selected={date}
                        captionLayout="dropdown"
                        month={month}
                        onMonthChange={setMonth}
                        onSelect={(date) => {
                            props.onChange(date ? convertDateToUTC(date) : null)
                            setValue(toString(date))
                            setOpen(false)
                        }}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}