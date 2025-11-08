import type {SVGProps} from "react";

export default function Logo(props: SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 700">
            { /* Clip paths */ }
            <defs>
                <clipPath id="shieldClip">
                    <path d="M60 60  H540  Q 560 60 560 80  L 540 480  C 540 480 540 660 300 660  C 300 660 80 660 60 480  L 40 80 Q40 60 60 60 Z"/>
                </clipPath>

                <clipPath id="shieldClip-right">
                    <path d="M300 60  H540  Q 560 60 560 80  L 540 480  C 540 480 540 660 300 660 Z"/>
                </clipPath>

                <clipPath id="shieldClip-left">
                    <path d="M60 60  H300 V 660  C 300 660 80 660 60 480  L 40 80 Q40 60 60 60 Z"/>
                </clipPath>
            </defs>

            { /* Left half */ }
            <g clipPath="url(#shieldClip)">
                <path d="M40 60 H300 V740 H 40 Z" fill="currentColor" stroke="none"/>
            </g>

            { /* Two diagonal bendlets */ }
            <g clipPath="url(#shieldClip-right)">
                { /* upper diagonal */ }
                <g transform="translate(0,0)">
                    <polygon points="300,80 580,300 580,450 300,230" fill="currentColor" opacity="1"/>
                </g>

                { /* lower diagonal */ }
                <g transform="translate(0,300)">
                    <polygon points="300,80 580,300 580,450 300,230" fill="currentColor" opacity="1"/>
                </g>
            </g>

            { /* Outline */ }
            <g fill="none" stroke="currentColor" stroke-width="15" stroke-linejoin="round">
                <path d="M60 60  H540  Q 560 60 560 80  L 540 480  C 540 480 540 660 300 660  C 300 660 80 660 60 480  L 40 80 Q40 60 60 60 Z"/>
                <path d="M300 60 V660"/>
            </g>
        </svg>

    )
}