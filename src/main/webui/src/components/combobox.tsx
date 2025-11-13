import type {SelectProps} from "./select.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "./ui/popover.tsx";
import {type CSSProperties, useRef, useState} from "react";
import {Button} from "./ui/button.tsx";
import {Check, X, ChevronExpand} from "react-bootstrap-icons";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "./ui/command.tsx";
import {cn} from "../lib/utils.ts";
import type {MouseEvent} from "react";
import i18next from "i18next";

export interface ComboBoxProps<TOption> extends SelectProps<TOption> {
    createAction?: () => void
}

export function ComboBox<TOption>(props: ComboBoxProps<TOption>) {
    const {options, value, onChange, optional, render, keyGenerator, emptyLabel, createAction} = props;

    const element = useRef<HTMLButtonElement>(null)
    const [open, setOpen] = useState(false)

    function change(option: TOption) {
        onChange(option);
        setOpen(false);
    }

    function clear(e: MouseEvent) {
        if (optional) {
            e.stopPropagation();
            onChange(null);
        }
    }

    const contentStyle: CSSProperties = {
        width: element.current ? element.current.clientWidth + "px" : undefined,
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    ref={element}
                    role="combobox"
                    aria-expanded={open}
                    className="justify-between font-normal">
                    {value
                        ? render(value)
                        : <span className={"opacity-50"}>{emptyLabel}</span>}
                    <div className={"flex items-center gap-1"}>
                        { (optional && value) && <div onClick={clear} className={"hover:bg-slate-300 transition-colors rounded-md p-1 opacity-50 cursor-pointer"}><X className={"size-4"}/></div> }
                        <ChevronExpand className="opacity-50"/>
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent style={contentStyle} className={"p-0"}>
                <Command>
                    <CommandInput placeholder={i18next.t("combobox.search")} className={"h-9"} />
                    <CommandList>
                        <CommandEmpty>{i18next.t("combobox.empty")}</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem key={keyGenerator(option)} value={render(option)} onSelect={() => change(option)}>
                                    {render(option)}
                                    <Check className={cn("ml-auto", (value && keyGenerator(value) === keyGenerator(option)) ? "opacity-100" : "opacity-0")}/>
                                </CommandItem>
                            ))}
                        </CommandGroup>

                        {createAction && (
                            <div className={"w-full p-1 pt-0"}>
                                <Button variant={"ghost"} className={"w-full"} onClick={createAction}>+ {i18next.t("combobox.create")}</Button>
                            </div>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
