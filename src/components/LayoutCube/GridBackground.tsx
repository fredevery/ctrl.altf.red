
import styles from "./LayoutCube.module.css";
import { useWindowResize } from "@/utilities/useWindowResize";

export default function GridBackground() {
    const { width, height } = useWindowResize();
    const strokeWidth = 3;
    const strokeColor = "var(--color-background-complementary)";
    const backTop = height * 0.3;
    const backLeft = width * 0.3;
    const backWidth = width - (backLeft * 2);
    const backHeight = height - (backTop * 2);
    const backRight = width - backLeft;
    const backBottom = height - backTop;

    return (
        <svg className={styles.gridBackground} viewBox={`0 0 ${width} ${height}`}>
            <rect
                x={backLeft}
                y={backTop}
                width={backWidth}
                height={backHeight}
                fill="none" stroke={strokeColor}
                strokeWidth={strokeWidth} />

            {[0.1, 0.5, 0.8].map((multiplier, i) => (
                <rect
                    key={`grid-rect-${i}`}
                    x={backLeft * multiplier}
                    y={backTop * multiplier}
                    width={width - backLeft * multiplier * 2}
                    height={height - backTop * multiplier * 2}
                    fill="none" stroke={strokeColor}
                    strokeWidth={strokeWidth} />
            )
            )}

            {[0.25, 0.5, 0.75].map((multiplier, i) => (
                <line
                    key={`grid-line-top-${i}`}
                    x1={width * multiplier}
                    y1={0}
                    x2={backLeft + (backWidth * multiplier)}
                    y2={backTop}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth} />
            ))}

            {[0.25, 0.5, 0.75].map((multiplier, i) => (
                <line
                    key={`grid-line-right-${i}`}
                    x1={width}
                    y1={height * multiplier}
                    x2={backRight}
                    y2={backTop + (backHeight * multiplier)}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth} />
            ))}

            {[0.25, 0.5, 0.75].map((multiplier, i) => (
                <line
                    key={`grid-line-top-${i}`}
                    x1={width * multiplier}
                    y1={height}
                    x2={backLeft + (backWidth * multiplier)}
                    y2={backBottom}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth} />
            ))}

            {[0.25, 0.5, 0.75].map((multiplier, i) => (
                <line
                    key={`grid-line-left-${i}`}
                    x1={0}
                    y1={height * multiplier}
                    x2={backLeft}
                    y2={backTop + (backHeight * multiplier)}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth} />
            ))}

            {[0.25, 0.5, 0.75].map((multiplier, i) => (
                <line
                    key={`grid-line-horizontal-${i}`}
                    x1={backLeft}
                    y1={backTop + (backHeight * multiplier)}
                    x2={backRight}
                    y2={backTop + (backHeight * multiplier)}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth} />
            ))}

            {[0.25, 0.5, 0.75].map((multiplier, i) => (
                <line
                    key={`grid-line-vertical-${i}`}
                    x1={backLeft + (backWidth * multiplier)}
                    y1={backTop}
                    x2={backLeft + (backWidth * multiplier)}
                    y2={backBottom}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth} />
            ))}

            <line
                x1={0}
                y1={0}
                x2={backLeft}
                y2={backTop}
                stroke={strokeColor}
                strokeWidth={strokeWidth} />
            <line
                x1={width}
                y1={0}
                x2={backRight}
                y2={backTop}
                stroke={strokeColor}
                strokeWidth={strokeWidth} />
            <line
                x1={width}
                y1={height}
                x2={backRight}
                y2={backBottom}
                stroke={strokeColor}
                strokeWidth={strokeWidth} />
            <line
                x1={0}
                y1={height}
                x2={backLeft}
                y2={backBottom}
                stroke={strokeColor}
                strokeWidth={strokeWidth} />

        </svg>
    )
}