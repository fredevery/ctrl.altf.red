'use client';

import styles from "./Grid.module.css";
import { useRef, useEffect, useState } from "react";
import { useWindowResize } from "@/utilities/useWindowResize";
import { usePageTransitionState } from "@/atoms/pageTransitionAtoms";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const GRID_SIZE = 6; // 20vw
const DURATION = 0.6;
const STAGGER = 0.01;
const POINT_SIZE = 10;
type GridLineConfig = {
    ref: (el: SVGLineElement) => void;
    key: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    stroke: string;
    strokeWidth: number;
}

type PatternConfig = {
    windowWidth: number;
    windowHeight: number;
    patternSpacing: number;
    patternCenter: number;
    // outerCrossSize: number;
    innerCrossSize: number;
    outerCrossColor: string;
    innerCrossColor: string;
    crossThickness: number;
    horizontalLineCount: number;
    verticalLineCount: number;
    lineSize: number;
    xOffset: number;
    yOffset: number;
    color: string;
}


function getPatternLineConfigs({
    horizontalLineCount,
    verticalLineCount,
    patternSpacing,
    outerCrossColor,
    crossThickness,
    color,
    lineSize,
    xOffset,
    yOffset
}: PatternConfig) {
    const horizontalLineConfigs = new Array(horizontalLineCount * verticalLineCount) as GridLineConfig[];
    const verticalLineConfigs = new Array(horizontalLineCount * verticalLineCount) as GridLineConfig[];
    for (let y = 0; y < horizontalLineCount; y++) {
        for (let x = 0; x < verticalLineCount; x++) {
            const index = y * verticalLineCount + x;
            const xCenter = x * patternSpacing + xOffset;
            const yCenter = y * patternSpacing + yOffset;

            horizontalLineConfigs[index] = {
                ref: () => { },
                key: `horizontal-line-${index}`,
                x1: xCenter - lineSize / 2,
                y1: y * patternSpacing + yOffset,
                x2: xCenter + lineSize / 2,
                y2: y * patternSpacing + yOffset,
                stroke: color,
                strokeWidth: crossThickness
            }

            verticalLineConfigs[index] = {
                ref: () => { },
                key: `vertical-line-${index}`,
                x1: x * patternSpacing + xOffset,
                y1: yCenter - lineSize / 2,
                x2: x * patternSpacing + xOffset,
                y2: yCenter + lineSize / 2,
                stroke: color,
                strokeWidth: crossThickness
            }
        }
    }

    return {
        horizontalLineConfigs,
        verticalLineConfigs
    }
}

function GridLines({ patternConfig }: { patternConfig: PatternConfig }) {
    const {
        windowWidth,
        windowHeight,
    } = patternConfig;

    const [allLineConfigs, setAllLineConfigs] = useState<GridLineConfig[]>([]);
    const [allPointConfigs, setAllPointConfigs] = useState<GridLineConfig[]>([]);

    const pageTransitionState = usePageTransitionState();
    const containerRef = useRef<SVGSVGElement>(null);

    const horizontalLineConfigsRef = useRef<GridLineConfig[]>([]);
    const verticalLineConfigsRef = useRef<GridLineConfig[]>([]);
    const horizontalSVGLinesRef = useRef<SVGLineElement[]>([]);
    const verticalSVGLinesRef = useRef<SVGLineElement[]>([]);

    const horizontalPointConfigsRef = useRef<GridLineConfig[]>([]);
    const verticalPointConfigsRef = useRef<GridLineConfig[]>([]);
    const horizontalSVGPointsRef = useRef<SVGLineElement[]>([]);
    const verticalSVGPointsRef = useRef<SVGLineElement[]>([]);

    useEffect(() => {
        const { horizontalLineConfigs, verticalLineConfigs } = getPatternLineConfigs({
            ...patternConfig,
            color: patternConfig.outerCrossColor,
            lineSize: patternConfig.patternSpacing
        });
        const { horizontalLineConfigs: horizontalPointConfigs, verticalLineConfigs: verticalPointConfigs } = getPatternLineConfigs({
            ...patternConfig,
            color: patternConfig.innerCrossColor,
            lineSize: POINT_SIZE
        });

        const newAllLineConfigs: GridLineConfig[] = []
        const newAllPointConfigs: GridLineConfig[] = []

        horizontalLineConfigsRef.current = horizontalLineConfigs;
        verticalLineConfigsRef.current = verticalLineConfigs;
        horizontalPointConfigsRef.current = horizontalPointConfigs;
        verticalPointConfigsRef.current = verticalPointConfigs;

        horizontalLineConfigs.forEach((lineConfig: GridLineConfig, index: number) => {
            const horizontalLineConfig = lineConfig;
            const verticalLineConfig = verticalLineConfigs[index];

            horizontalLineConfig.ref = (el: SVGLineElement) => { horizontalSVGLinesRef.current[index] = el }
            verticalLineConfig.ref = (el: SVGLineElement) => { verticalSVGLinesRef.current[index] = el }

            newAllLineConfigs.push(horizontalLineConfig);
            newAllLineConfigs.push(verticalLineConfig);
        });

        horizontalPointConfigs.forEach((lineConfig: GridLineConfig, index: number) => {
            const horizontalLineConfig = lineConfig;
            const verticalLineConfig = verticalPointConfigs[index];

            horizontalLineConfig.ref = (el: SVGLineElement) => { horizontalSVGPointsRef.current[index] = el }
            verticalLineConfig.ref = (el: SVGLineElement) => { verticalSVGPointsRef.current[index] = el }

            newAllPointConfigs.push(horizontalLineConfig);
            newAllPointConfigs.push(verticalLineConfig);
        });

        setAllLineConfigs(newAllLineConfigs);
        setAllPointConfigs(newAllPointConfigs);

    }, [windowWidth, windowHeight, patternConfig]);

    // useGSAP(() => {
    //     const transitionIn = pageTransitionState.isIdle();
    //     const fullLineSize = patternConfig.patternSpacing;
    //     const pointLineSize = POINT_SIZE;
    //     const timeline = gsap.timeline({
    //         defaults: {
    //             duration: transitionIn ? DURATION : 0.6,
    //             // ease: "power2.inOut",
    //         }
    //     });


    //     const visible = {
    //         opacity: 1,
    //         // rotation: 0,
    //     }
    //     const hidden = {
    //         opacity: 0,
    //         // rotation: 90,
    //     }
    //     timeline.to(horizontalSVGPointsRef.current,
    //         {
    //             ...(transitionIn ? visible : hidden),
    //             stagger: transitionIn ? {
    //                 each: STAGGER,
    //                 from: "center",
    //                 // grid: "auto"
    //             } : undefined,
    //         });

    //     timeline.to(verticalSVGPointsRef.current,
    //         {
    //             ...(transitionIn ? visible : hidden),
    //             delay: transitionIn ? 0.1 : 0,
    //             stagger: transitionIn ? {
    //                 each: STAGGER,
    //                 from: "center",
    //                 // grid: "auto"
    //             } : undefined
    //         }, "<")

    //     // timeline.to(horizontalSVGLinesRef.current, {
    //     //     scaleX: transitionIn ? 1 : 0,
    //     //     translateX: transitionIn ? 0 : fullLineSize / 2,
    //     //     stagger: transitionIn ? {
    //     //         each: STAGGER,
    //     //         from: "center",
    //     //         grid: "auto"
    //     //     } : undefined,
    //     // });

    //     // timeline.to(verticalSVGLinesRef.current, {
    //     //     scaleY: transitionIn ? 1 : 0,
    //     //     translateY: transitionIn ? 0 : fullLineSize / 2,
    //     //     delay: transitionIn ? 0.1 : 0,
    //     //     stagger: transitionIn ? {
    //     //         each: STAGGER,
    //     //         from: "center",
    //     //         grid: "auto"
    //     //     } : undefined
    //     // }, "<")


    // }, {
    //     scope: containerRef,
    //     dependencies: [pageTransitionState.state],
    // })

    return (
        <svg ref={containerRef} className={`${styles.gridPattern}`} height="100%" width="100%">
            <g className="grid-lines">
                {allLineConfigs.map((line) => (
                    <line
                        ref={line.ref}
                        key={line.key}
                        x1={line.x1}
                        y1={line.y1}
                        x2={line.x2}
                        y2={line.y2}
                        stroke={line.stroke}
                        strokeWidth={line.strokeWidth}
                    />
                ))}
            </g>
            <g className="grid-points">
                {allPointConfigs.map((line) => (
                    <line
                        ref={line.ref}
                        key={line.key}
                        x1={line.x1}
                        y1={line.y1}
                        x2={line.x2}
                        y2={line.y2}
                        stroke={line.stroke}
                        strokeWidth={line.strokeWidth}
                    />
                ))}
            </g>
        </svg>
    )
}

// function GridPoints({ patternConfig }: { patternConfig: PatternConfig }) {
//     const {
//         windowWidth,
//         windowHeight,
//         horizontalLineCount,
//         verticalLineCount,
//         patternSpacing,
//         patternCenter,
//         outerCrossColor,
//         crossThickness,
//         xOffset,
//         yOffset
//     } = patternConfig;

//     const pageTransitionState = usePageTransitionState();
//     const containerRef = useRef<SVGSVGElement>(null);
//     return (
//         <svg className={`${styles.pointPattern}`} height="100%" width="100%">

//         </svg>
//     )
// }

export default function Grid() {
    const [patternConfig, setPatternConfig] = useState<PatternConfig>({
        windowWidth: 0,
        windowHeight: 0,
        patternSpacing: 200,
        patternCenter: 100,
        innerCrossSize: 8,
        outerCrossColor: "#ffffff00",
        innerCrossColor: "#ffffff11",
        crossThickness: 2,
        horizontalLineCount: 0,
        verticalLineCount: 0,
        xOffset: 0,
        yOffset: 0,
        lineSize: 0,
        color: "#ffffff",
    })
    const windowSize = useWindowResize();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const {
            width: windowWidth,
            height: windowHeight
        } = windowSize;

        if (windowWidth === 0 || windowHeight === 0) return;

        const patternSpacing = Math.ceil(windowWidth * (GRID_SIZE / 100));
        const patternCenter = patternSpacing / 2;
        const outerCrossSize = patternSpacing;
        const horizontalLineCount = Math.ceil(windowSize.width / patternSpacing);
        const verticalLineCount = Math.ceil(windowSize.width / patternSpacing);
        const xOffset = (windowWidth - verticalLineCount * patternSpacing) / 2 + patternCenter;
        const yOffset = xOffset; //(windowWidth - horizontalLineCount * patternSpacing) / 2 + patternCenter;
        // yOffset = horizontalLineCount % 2 === 0 ? yOffset : yOffset + patternCenter;

        setPatternConfig((prevConfig) => ({
            ...prevConfig,
            windowHeight,
            windowWidth,
            patternSpacing,
            patternCenter,
            outerCrossSize,
            horizontalLineCount: horizontalLineCount + 1,
            verticalLineCount: verticalLineCount + 1,
            xOffset,
            yOffset,
        }))
    }, [windowSize, setPatternConfig])

    return (
        <div ref={containerRef} className={styles.gridContainer}>
            {/* <GridLines patternConfig={patternConfig} /> */}
            {/* <GridPoints patternConfig={patternConfig} /> */}
            <svg className={`${styles.pointPattern}`} height="100%" width="100%">
                <defs>
                    <pattern id="point-pattern" patternUnits="userSpaceOnUse"
                        width={patternConfig.patternSpacing}
                        height={patternConfig.patternSpacing}
                        viewBox={`0 0 ${patternConfig.patternSpacing} ${patternConfig.patternSpacing}`}
                        x={`calc(50vw - ${patternConfig.patternCenter}px)`}
                        y={`calc(50vh - ${patternConfig.patternCenter}px)`}>
                        <g transform={`rotate(0, ${patternConfig.patternCenter}, ${patternConfig.patternCenter})`}>
                            <line
                                x1={patternConfig.patternCenter}
                                y1={patternConfig.patternCenter - patternConfig.innerCrossSize / 2}
                                x2={patternConfig.patternCenter}
                                y2={patternConfig.patternCenter + patternConfig.innerCrossSize / 2}
                                stroke={patternConfig.innerCrossColor}
                                strokeWidth={patternConfig.crossThickness}
                            />
                            <line
                                x1={patternConfig.patternCenter - patternConfig.innerCrossSize / 2}
                                y1={patternConfig.patternCenter}
                                x2={patternConfig.patternCenter + patternConfig.innerCrossSize / 2}
                                y2={patternConfig.patternCenter}
                                stroke={patternConfig.innerCrossColor}
                                strokeWidth={patternConfig.crossThickness} />
                        </g>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#point-pattern)" />
            </svg>
        </div>
    )
}