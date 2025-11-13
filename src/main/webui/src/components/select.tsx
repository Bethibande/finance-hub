import {Popover, PopoverContent, PopoverTrigger} from "./ui/popover.tsx";
import {Button} from "./ui/button.tsx";
import {Check, ChevronDown, X} from "react-bootstrap-icons";
import {type CSSProperties, type KeyboardEvent, type MouseEvent, useEffect, useRef, useState} from "react";
import {cn} from "../lib/utils.ts";

export interface SelectProps<T> {
    value?: T,
    emptyLabel: string,
    onChange: (value: T | null) => void,
    optional?: boolean,
    options: T[],
    keyGenerator: (option: T) => string,
    render: (option: T) => string
}

export function Select<TOption>(props: SelectProps<TOption>) {
    const {value, options, onChange, emptyLabel, optional, render, keyGenerator} = props;

    const [open, setOpen] = useState(false);

    const element = useRef<HTMLButtonElement>(null)

    const [focused, setFocused] = useState<number>(-1);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
    const items = options.map((option, i) => {
        return (
            <Button variant={"ghost"}
                    role={"option"}
                    className={"justify-start font-normal cursor-pointer"}
                    key={keyGenerator(option)}
                    ref={(el) => {
                        itemRefs.current[i] = el
                    }}
                    onFocus={() => setFocused(i)}
                    onClick={() => onClick(option)}>
                <Check className={value === option ? "opacity-100" : "opacity-0"}/>
                {render(option)}
            </Button>
        )
    })

    useEffect(() => {
        setFocused(value && options.indexOf(value) || -1)
    }, [value])

    function onClick(option: TOption) {
        onChange(option);
        setOpen(false);
    }

    function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            const mod = e.key === "ArrowDown" ? 1 : -1;
            let focus = (focused + mod) % options.length;
            if (focus < 0) focus = options.length - 1;

            itemRefs.current[focus]?.focus();
            setFocused(focus);
        }
    }

    function onTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
        if (e.key === "ArrowDown") {
            setOpen(true);
            setTimeout(() => {
                itemRefs.current[focused]?.focus();
            }, 0)
        }
    }

    function clear(e: MouseEvent) {
        e.stopPropagation()
        onChange(null);
    }

    const contentStyle: CSSProperties = {
        width: element.current ? element.current.clientWidth + "px" : undefined,
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button onKeyDown={onTriggerKeyDown}
                        variant={"outline"}
                        ref={element}
                        className={"flex justify-between items-center font-normal"}>
                    {value ? render(value) : emptyLabel}

                    <div className={"flex items-center gap-1"}>
                        {(optional && value) && <div onClick={clear}
                                                     className={"hover:bg-slate-300 transition-colors rounded-md p-1 opacity-50 cursor-pointer"}>
                            <X className={"size-4"}/></div>}
                        <ChevronDown className={cn("transition-transform opacity-50", open && "rotate-180")}/>
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent style={contentStyle} onKeyDown={onKeyDown} className={"p-2 rounded-xl flex flex-col"}>
                {items}
            </PopoverContent>
        </Popover>
    )
}
