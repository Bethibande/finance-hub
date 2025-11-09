import {Popover, PopoverContent, PopoverTrigger} from "./ui/popover.tsx";
import {Button} from "./ui/button.tsx";
import {ChevronDown} from "react-bootstrap-icons";
import {type ReactNode, useState} from "react";
import {cn} from "../lib/utils.ts";

export interface SelectOption<T> {
    value?: T,
    emptyLabel: string,
    onChange: (value: T) => void,
    options: T[],
    keyGenerator: (option: T) => string,
    render: (option: T) => ReactNode
}

export function Select<TOption>(props: SelectOption<TOption>) {
    const {value, options, onChange, emptyLabel, render, keyGenerator} = props;

    const [open, setOpen] = useState(false);

    function onClick(option: TOption) {
        onChange(option);
        setOpen(false);
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant={"outline"} className={"flex justify-between items-center font-normal"}>
                    {value ? render(value) : emptyLabel}

                    <ChevronDown className={cn("transition-transform", open && "rotate-180")}/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className={"p-1"}>
                <div className={"flex flex-col"}>
                    {options.map((option) => (
                        <Button variant={"ghost"}
                                role={"option"}
                                className={"justify-start font-normal cursor-pointer"}
                                key={keyGenerator(option)}
                                onClick={() => onClick(option)}>
                            {render(option)}
                        </Button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}
