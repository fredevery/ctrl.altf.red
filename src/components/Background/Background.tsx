import styles from "./Background.module.css";

const PATTERN_SPACING = 50;
const PATTERN_CENTER = PATTERN_SPACING / 2;
const CROSS_SIZE = 10;
const CROSS_COLOR = "#4a4a4a"
const CROSS_THICKNESS = 0.5;

export default function Background() {
    return (
        <div className={styles.background}>
            <svg className={`${styles.svgPattern}`} height="100%" width="100%">
                <defs>
                    <pattern id="cross-pattern" patternUnits="userSpaceOnUse" 
                        width={PATTERN_SPACING} 
                        height={PATTERN_SPACING} 
                        viewBox={`0 0 ${PATTERN_SPACING} ${PATTERN_SPACING}`} 
                        x={`calc(50vw - ${PATTERN_CENTER}px)`} 
                        y={`calc(50vh - ${PATTERN_CENTER}px)`}>
                            <g transform={`rotate(0, ${PATTERN_CENTER}, ${PATTERN_CENTER})`}>

                                <line 
                                    x1={PATTERN_CENTER} 
                                    y1={PATTERN_CENTER - CROSS_SIZE / 2} 
                                    x2={PATTERN_CENTER} 
                                    y2={PATTERN_CENTER + CROSS_SIZE / 2} 
                                    stroke={CROSS_COLOR} 
                                    strokeWidth={CROSS_THICKNESS}
                                    />
                                <line 
                                    x1={PATTERN_CENTER - CROSS_SIZE / 2} 
                                    y1={PATTERN_CENTER} 
                                    x2={PATTERN_CENTER + CROSS_SIZE / 2} 
                                    y2={PATTERN_CENTER} 
                                    stroke={CROSS_COLOR} 
                                    strokeWidth={CROSS_THICKNESS} />
                            </g>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#cross-pattern)" />
            </svg>
        </div>
    )
}