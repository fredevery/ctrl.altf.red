'use client';
import userAgent from "@/utilities/userAgent";

export default function SVGFilters () {
    const pixelSize = 4;
    return (
        <>
        { !userAgent.iOS && (
            <svg xmlns="http://www.w3.org/2000/svg" height="0" width="0">
                <defs>
                    <filter id="phosphor-glow">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="glow" />
                        <feOffset dx="0" dy="3" in="glow" result="glowOffsetRight" />
                        <feOffset dx="0" dy="-3" in="glow" result="glowOffsetLeft" />
                        <feMerge result="mergedGlow">
                            <feMergeNode in="glowOffsetRight" />
                            <feMergeNode in="glowOffsetLeft" />
                        </feMerge>
                        <feComponentTransfer in="mergedGlow" result="dimGlow">
                            <feFuncA type="linear" slope="0.5" />
                        </feComponentTransfer>
                        <feMorphology in="SourceGraphic" operator="erode" radius="0.5" result="eroded" />
                        {/* <feComponentTransfer in="eroded" result="erodedBright">
                            <feFuncR type="linear" slope="10" />
                            <feFuncG type="linear" slope="10" />
                            <feFuncB type="linear" slope="10" />
                        </feComponentTransfer> */}
                        <feComposite in="SourceGraphic" in2="dimGlow" operator="over" result="firstComposite" />
                        <feGaussianBlur in="eroded" stdDeviation="1" result="erodedGlow" />
                        <feComposite in="firstComposite" in2="erodedGlow" operator="lighter" />
                        {/* <feComposite in="SourceGraphic" in2="added" operator="in" /> */}
                        {/* <feBlend in2="SourceGraphic" in="dimGlow" mode="lighten" /> */}
                    </filter>
                    <filter id="phosphor-glow-simple">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                        {/* <feComponentTransfer in="blur" result="transparentBlur">
                            <feFuncA type="linear" slope="0.5" />
                        </feComponentTransfer> */}
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="pixelate" filterUnits="userSpaceOnUse">
                        <feImage href="#pixel-border" result="pixelBorder" height={pixelSize * 2} width={pixelSize * 2} />
                        <feTile in="pixelBorders" result="tiledPixels" />
                        <feComposite in2="tiledPixels" in="SourceGraphic" operator="out" />
                    </filter>
                    <path id="pixel-border" d={`M 0,${pixelSize} H ${pixelSize * 2} M ${pixelSize},0 V ${pixelSize * 2}`} fill="none" stroke="black" strokeWidth="1" />
                </defs>

            </svg>
        )}
        </>
    )
}