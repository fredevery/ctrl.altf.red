'use client';
import userAgent from "@/utilities/userAgent";

export default function SVGFilters() {
    const pixelSize = 4;
    const pixelCenter = pixelSize / 2;
    return (
        <>
            {!userAgent.iOS && (
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
                        <filter id="glitch">
                            <feFlood
                                floodColor="#fff"
                                floodOpacity="1"
                                x="500"
                                y="700"
                                height="50"
                                width="2000"
                                result="block" />
                            <feComposite
                                operator="in"
                                in2="block"
                                in="SourceGraphic"
                                result="comp" />
                            <feOffset in="comp"
                                dx="20"
                                dy="0"
                                result="offset" />
                            <feColorMatrix
                                in="offset"
                                type="matrix"
                                values="
                                1 0 0 0 0
                                0 0 0 0 0
                                0 0 0 0 0
                                1 1 1 0 0"
                                result="out" />
                            <feComposite
                                operator="over"
                                in="out"
                                in2="SourceGraphic" />
                        </filter>
                    </defs>
                </svg>
            )}
            <svg xmlns="http://www.w3.org/2000/svg" height="0" width="0">
                <defs>
                    <pattern id="pixel-pattern" patternUnits="userSpaceOnUse"
                        width={pixelSize}
                        height={pixelSize}
                        viewBox={`0 0 ${pixelSize} ${pixelSize}`}
                        x={`calc(50vw - ${pixelCenter}px)`}
                        y={`calc(50vh - ${pixelCenter}px)`}>
                        <rect x="0" y="0" width={pixelSize} height={pixelSize} fill="#aaa" />
                        <rect x="0.5" y="0.5" width={pixelSize - 1} height={pixelSize - 1} fill="white" />
                    </pattern>
                    <mask id="pixel-mask">
                        <rect x="0" y="0" width="100vw" height="100vh" fill="url(#pixel-pattern)" />
                    </mask>

                </defs>
            </svg>
        </>
    )
}