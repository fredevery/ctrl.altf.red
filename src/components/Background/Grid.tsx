import styles from "./Background.module.css";
import { useRef, useEffect, useState } from "react";
import { useWindowResize } from "@/utilities/useWindowResize";

const GRID_SIZE = 8;

export default function Grid() {
    const [patternConfig, setPatternConfig] = useState({
        patternSpacing: 200,
        patternCenter: 100,
        outerCrossSize: 200,
        innerCrossSize: 8,
        outerCrossColor: "#ffffff11",
        innerCrossColor: "#ffffff66",
        crossThickness: 1,
    })
    const { 
        patternSpacing, 
        patternCenter, 
        outerCrossSize, 
        innerCrossSize, 
        outerCrossColor, 
        innerCrossColor, 
        crossThickness 
    } = patternConfig;
    const videoRef = useRef<HTMLVideoElement>(null);
    const windowSize = useWindowResize();
    useEffect(() => {
        const {
            width: windowWidth
        } = windowSize;
        
        const patternSpacing = windowWidth / GRID_SIZE;
        const patternCenter = patternSpacing / 2;
        const outerCrossSize = patternSpacing;

        setPatternConfig((prevConfig) => ({
            ...prevConfig,
            patternSpacing,
            patternCenter,
            outerCrossSize

        }))

    }, [videoRef, windowSize, setPatternConfig])

    return (
        <svg className={`${styles.svgPattern}`} height="100%" width="100%">
        <defs>
            <pattern id="cross-pattern" patternUnits="userSpaceOnUse" 
                width={patternSpacing} 
                height={patternSpacing} 
                viewBox={`0 0 ${patternSpacing} ${patternSpacing}`} 
                x={`calc(50vw - ${patternCenter}px)`} 
                y={`calc(50vh - ${patternCenter}px)`}>
                    <g transform={`rotate(0, ${patternCenter}, ${patternCenter})`}>
                        <line
                            x1={patternCenter}
                            y1={patternCenter - outerCrossSize / 2}
                            x2={patternCenter}
                            y2={patternCenter + outerCrossSize / 2}
                            stroke={outerCrossColor}
                            strokeWidth={crossThickness}
                            />
                        <line
                            x1={patternCenter - outerCrossSize / 2}
                            y1={patternCenter}
                            x2={patternCenter + outerCrossSize / 2}
                            y2={patternCenter}
                            stroke={outerCrossColor}
                            strokeWidth={crossThickness}
                            /> 

                        <line 
                            x1={patternCenter} 
                            y1={patternCenter - innerCrossSize / 2} 
                            x2={patternCenter} 
                            y2={patternCenter + innerCrossSize / 2} 
                            stroke={innerCrossColor} 
                            strokeWidth={crossThickness}
                            />
                        <line 
                            x1={patternCenter - innerCrossSize / 2} 
                            y1={patternCenter} 
                            x2={patternCenter + innerCrossSize / 2} 
                            y2={patternCenter} 
                            stroke={innerCrossColor} 
                            strokeWidth={crossThickness} />
                    </g>
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cross-pattern)" />
    </svg>
    )
}