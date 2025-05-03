'use client';

import { useState, useEffect, useRef } from "react";
import { v4 as uuid } from "uuid";

import styles from "./Window.module.css";
import { useWindowResize } from "@/utilities/useWindowResize";

interface WindowProps extends React.HTMLProps<HTMLDivElement> {
    title?: string;
}

const WINDOW_CORNER_SIZE = 6;
const WINDOW_CORNER_BORDER_SIZE = 1;
const WINDOW_FRAME_GAP = 4;
const WINDOW_ZINDEX_MIN = 100;
const WINDOW_ZINDEX_MAX = 200;

interface WindowElement extends HTMLDivElement {
    windowId?: string;
}

const windowManager: {
    windows: Map<string, WindowElement>;
    topWindow: HTMLDivElement | null;
    windowOrder: Set<string>;
    addWindow: (window: WindowElement) => void;
    removeWindow: (window: WindowElement) => void;
    setTopWindow: (window: WindowElement) => void;
    processWindowOrder: () => void;
} = {
    windows: new Map(),
    topWindow: null,
    windowOrder: new Set(),
    addWindow: (window: WindowElement) => {
        window.windowId = uuid();
        console.log("addWindow", window.windowId, window)
        windowManager.windows.set(window.windowId, window);
        windowManager.windowOrder.add(window.windowId);
        windowManager.processWindowOrder();
    },
    removeWindow: (window: WindowElement) => {
        console.log("removeWindow", window.windowId, window)
        windowManager.windows.delete(window.windowId!);
        windowManager.windowOrder.delete(window.windowId!);
        windowManager.processWindowOrder();
    },
    setTopWindow: (window: WindowElement) => {
        const newWindowOrder = new Set<string>();
        Array.from(windowManager.windowOrder).forEach((windowId) => {
            if (windowId !== window.windowId) {
                newWindowOrder.add(windowId);
            }
        });
        newWindowOrder.add(window.windowId!);
        windowManager.windowOrder = newWindowOrder;
        windowManager.processWindowOrder();
    },
    processWindowOrder: () => {
        const windowOrder = Array.from(windowManager.windowOrder);
        windowOrder.forEach((windowId, index) => {
            const window = windowManager.windows.get(windowId);
            if (window) {
                window.style.zIndex = (WINDOW_ZINDEX_MIN + index).toString();
            }
        });
    }
}

function WindowHeaderRibbon({ side }: { side?: "left" | "right" }) {
    // const textChar = side === "left" ? "\\" : "/";
    return (
        <svg className={`${styles.windowHeaderRibbon} window-header-ribbon`}>
            <defs>
                <pattern id={`window-header-ribbon-${side}`} height="6px" width="6px" patternUnits="userSpaceOnUse">
                    {/* <circle cx="3px" cy="25%" r="1.5" fill="white" />
                    <circle cx="3px" cy="50%" r="1.5" fill="white" />
                    <circle cx="3px" cy="75%" r="1.5" fill="white" /> */}
                    {/* <text x="-0.2rem" y="0.8rem" fill="rgba(255,255,255,0.5)" font-size="1rem" >{textChar}</text> */}
                    {side === "left" ? (
                        <line x1="0" y1="0" x2="6px" y2="6px" stroke="white" strokeWidth="1px" />
                    ) : (
                        <line x1="6px" y1="0" x2="0" y2="6px" stroke="white" strokeWidth="1px" />
                    )}
                </pattern>
                <mask id={`window-ribbon-mask-${side}`}>
                    <rect x="0" y="0" width="100%" height="100%" fill={`url(#window-header-ribbon-${side})`} />
                </mask>
            </defs>
            <rect x="0" y="0" height="100%" width="100%" mask={`url(#window-ribbon-mask-${side})`} />
        </svg>
    )
}

export function WindowFrameStyle() {
    const frameWidth = 1000;
    const frameHeight = 1000;
    const frameBorderGap = 4;
    const sideBorderColor = "rgba(255,255,255,0.3)";
    const cornerColor = "rgba(255, 255, 255, 0.7)";

    const svgOpenTag = `<svg xmlns="http://www.w3.org/2000/svg" width="${frameWidth}" height="${frameHeight}" viewBox="0 0 ${frameWidth} ${frameHeight}">`;
    const svgCloseTag = `</svg>`;
    const topLeftCorner = `
        <rect x="0" y="0" width="${WINDOW_CORNER_SIZE}" height="${WINDOW_CORNER_BORDER_SIZE}" fill="${cornerColor}" />
        <rect x="0" y="0" width="${WINDOW_CORNER_BORDER_SIZE}" height="${WINDOW_CORNER_SIZE}" fill="${cornerColor}" />
    `;
    const topRightCorner = `
        <rect x="${frameWidth - WINDOW_CORNER_SIZE}" y="0" width="${WINDOW_CORNER_SIZE}" height="${WINDOW_CORNER_BORDER_SIZE}" fill="${cornerColor}" />
        <rect x="${frameWidth - WINDOW_CORNER_BORDER_SIZE}" y="0" width="${WINDOW_CORNER_BORDER_SIZE}" height="${WINDOW_CORNER_SIZE}" fill="${cornerColor}" />
    `;
    const bottomRightCorner = `
        <rect x="${frameWidth - WINDOW_CORNER_SIZE}" y="${frameHeight - WINDOW_CORNER_BORDER_SIZE}" width="${WINDOW_CORNER_SIZE}" height="${WINDOW_CORNER_BORDER_SIZE}" fill="${cornerColor}" />
        <rect x="${frameWidth - WINDOW_CORNER_BORDER_SIZE}" y="${frameHeight - WINDOW_CORNER_SIZE}" width="${WINDOW_CORNER_BORDER_SIZE}" height="${WINDOW_CORNER_SIZE}" fill="${cornerColor}" />
    `;
    const bottomLeftCorner = `
        <rect x="0" y="${frameHeight - WINDOW_CORNER_BORDER_SIZE}" width="${WINDOW_CORNER_SIZE}" height="${WINDOW_CORNER_BORDER_SIZE}" fill="${cornerColor}" />
        <rect x="0" y="${frameHeight - WINDOW_CORNER_SIZE}" width="${WINDOW_CORNER_BORDER_SIZE}" height="${WINDOW_CORNER_SIZE}" fill="${cornerColor}" />
    `;
    const topBorder = `<rect x="${WINDOW_CORNER_SIZE + frameBorderGap}" y="0" width="${frameWidth - (WINDOW_CORNER_SIZE * 2) - (frameBorderGap * 2)}" height="${WINDOW_CORNER_BORDER_SIZE}" fill="${sideBorderColor}" />`;
    const bottomBorder = `<rect x="${WINDOW_CORNER_SIZE + frameBorderGap}" y="${frameHeight - WINDOW_CORNER_BORDER_SIZE}" width="${frameWidth - (WINDOW_CORNER_SIZE * 2) - (frameBorderGap * 2)}" height="${WINDOW_CORNER_BORDER_SIZE}" fill="${sideBorderColor}" />`;
    const leftBorder = `<rect x="0" y="${WINDOW_CORNER_SIZE + frameBorderGap}" width="${WINDOW_CORNER_BORDER_SIZE}" height="${frameHeight - (WINDOW_CORNER_SIZE * 2) - (frameBorderGap * 2)}" fill="${sideBorderColor}" />`;
    const rightBorder = `<rect x="${frameWidth - WINDOW_CORNER_BORDER_SIZE}" y="${WINDOW_CORNER_SIZE + frameBorderGap}" width="${WINDOW_CORNER_BORDER_SIZE}" height="${frameHeight - (WINDOW_CORNER_SIZE * 2) - (frameBorderGap * 2)}" fill="${sideBorderColor}" />`;

    const windowFrameSVG = [
        svgOpenTag,
        topLeftCorner,
        topBorder,
        topRightCorner,
        bottomRightCorner,
        bottomBorder,
        bottomLeftCorner,
        svgCloseTag
    ]

    const windowHeaderSVG = [
        svgOpenTag,
        bottomLeftCorner,
        bottomBorder,
        bottomRightCorner,
        svgCloseTag
    ]

    const windowContentFrame = [
        svgOpenTag,
        leftBorder,
        topLeftCorner,
        topRightCorner,
        rightBorder,
        svgCloseTag
    ]

    return (
        <style>{`
            .window-frame {
                border: ${WINDOW_CORNER_SIZE + frameBorderGap}px solid magenta;
                border-image-source: url('data:image/svg+xml,${encodeURIComponent(windowFrameSVG.join(''))}');
                border-image-slice: ${WINDOW_CORNER_SIZE + frameBorderGap};
            }
            .window-header-frame {
                border: ${WINDOW_CORNER_SIZE + frameBorderGap}px solid magenta;
                border-image-source: url('data:image/svg+xml,${encodeURIComponent(windowHeaderSVG.join(''))}');
                border-image-slice: ${WINDOW_CORNER_SIZE + frameBorderGap};
            }
            .window-content-frame {
                border: ${WINDOW_CORNER_SIZE + frameBorderGap}px solid magenta;
                border-image-source: url('data:image/svg+xml,${encodeURIComponent(windowContentFrame.join(''))}');
                border-image-slice: ${WINDOW_CORNER_SIZE + frameBorderGap};
            }
        `}
        </style>

    )
}


function WindowHeader({
    title,
    onMouseDown,
    onResetPosition
}: {
    title?: string,
    onMouseDown?: (event: React.MouseEvent) => void,
    onResetPosition?: (event: React.MouseEvent) => void
}) {
    const windowHeaderRef = useRef<HTMLDivElement>(null);
    return (
        <div ref={windowHeaderRef} className={styles.windowHeader}>
            <div className={styles.windowHeaderContent}>
                <div className={styles.windowHeaderLeft}></div>
                <div className={styles.windowHeaderCenter} onMouseDown={onMouseDown}>
                    <WindowHeaderRibbon side="left" />
                    {title && (
                        <>
                            <div className={styles.windowTitle}>
                                {title}
                            </div>
                            <WindowHeaderRibbon side="right" />
                        </>
                    )}
                </div>
                <div className={styles.windowHeaderRight} onClick={onResetPosition}></div>
            </div>
            <div className={`${styles.windowHeaderFrame} window-header-frame`} />
        </div>
    )
}

export default function Window({ children, ...props }: WindowProps) {
    // const rootWindowSize = useWindowResize();
    const dragStartCoordinates = useRef({
        mouseStart: {
            x: 0,
            y: 0
        },
        offsetStart: {
            x: 0,
            y: 0
        }
    })
    const dragOffset = useRef({
        x: 0,
        y: 0
    })
    const windowRef = useRef<HTMLDivElement>(null);
    // const [windowSize, setWindowSize] = useState({
    //     width: 0,
    //     height: 0,
    // })

    // useEffect(() => {
    //     console.log("windowRef", { windowRef: windowRef.current });
    //     setWindowSize({
    //         width: windowRef.current!.clientWidth,
    //         height: windowRef.current!.clientHeight,
    //     });
    // }, [rootWindowSize])
    // const windowHeaderRef = useRef<HTMLDivElement>(null);
    const handleDrag = useRef((event: MouseEvent) => {
        const { mouseStart, offsetStart } = dragStartCoordinates.current;
        dragOffset.current = {
            x: offsetStart.x + (event.clientX - mouseStart.x),
            y: offsetStart.y + (event.clientY - mouseStart.y)
        }
        windowRef.current!.style.transform = `translate(${dragOffset.current.x}px, ${dragOffset.current.y}px)`
    });
    const handleMouseUp = useRef(() => {
        // windowHeaderRef.current!.classList.remove("dragging");
        window.removeEventListener("mousemove", handleDrag.current);
        window.removeEventListener("mouseup", handleMouseUp.current);
    });
    const handleResetPosition = useRef((event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        dragOffset.current = {
            x: 0,
            y: 0
        }
        windowRef.current!.style.transform = `translate(0px, 0px)`
    });

    useEffect(() => {
        const windowRefCurrent = windowRef.current!;
        windowManager.addWindow(windowRefCurrent);
        return () => {
            windowManager.removeWindow(windowRefCurrent);
        }
    }, [windowRef])

    if (props.className) {
        props.className = `window ${styles.window} ${props.className}`;
    } else {
        props.className = `window ${styles.window}`;
    }

    function getWindowTranslate() {
        const windowStyles = window.getComputedStyle(windowRef.current!);
        const transform = windowStyles.getPropertyValue("transform");
        const translate = {
            x: 0,
            y: 0
        };

        if (transform !== "none") {
            const matrix = transform.match(/matrix\(([^)]+)\)/);
            if (matrix) {
                const values = matrix[1].split(", ");
                translate.x = parseFloat(values[4]);
                translate.y = parseFloat(values[5]);
            }
        }

        return translate;
    }

    function startDrag(event: React.MouseEvent) {
        event.preventDefault();
        dragStartCoordinates.current.mouseStart = {
            x: event.clientX,
            y: event.clientY
        }
        dragStartCoordinates.current.offsetStart = getWindowTranslate();

        windowManager.setTopWindow(windowRef.current!);
        // windowHeaderRef.current!.classList.add("dragging");
        window.addEventListener("mousemove", handleDrag.current);
        window.addEventListener("mouseup", handleMouseUp.current);
    }

    return (
        <div ref={windowRef} {...props}>
            <WindowHeader title={props.title} onMouseDown={startDrag} onResetPosition={handleResetPosition.current} />
            <div className={styles.windowBody}>
                <div className={styles.windowBodyContent}>
                    {children}
                </div>
                <div className={`window-content-frame ${styles.windowContentFrame}`} />
            </div>
            <div className={`window-frame ${styles.windowFrame}`} />
        </div>
    )
}