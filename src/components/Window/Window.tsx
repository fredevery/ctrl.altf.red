'use client';

import { useRef } from "react";

import styles from "./Window.module.css";

interface WindowProps extends React.HTMLProps<HTMLDivElement> {
    title?: string;
}

function WindowHeaderRibbon() {
    return (
        <svg className={styles.windowHeaderRibbon}>
            <defs>
                <pattern id="window-header-ribbon" height="100%" width="6px" patternUnits="userSpaceOnUse">
                    <circle cx="3px" cy="25%" r="1.5" fill="white" />
                    <circle cx="3px" cy="50%" r="1.5" fill="white" />
                    <circle cx="3px" cy="75%" r="1.5" fill="white" />
                </pattern>
            </defs>
            <rect x="0" y="0" height="100%" width="100%" fill="url(#window-header-ribbon)" />
        </svg>
    )
}

export default function Window({ children, ...props }: WindowProps) {
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
    const windowHeaderRef = useRef<HTMLDivElement>(null);
    const handleDrag = useRef((event: MouseEvent) => {
        window.addEventListener("mouseup", handleMouseUp.current);
        const { mouseStart, offsetStart } = dragStartCoordinates.current;
        dragOffset.current = {
            x: offsetStart.x + (event.clientX - mouseStart.x),
            y: offsetStart.y + (event.clientY - mouseStart.y)
        }
        windowRef.current!.style.transform = `translate(${dragOffset.current.x}px, ${dragOffset.current.y}px)`
    });
    const handleMouseUp = useRef(() => {
        windowHeaderRef.current!.classList.remove("dragging");
        window.removeEventListener("mousemove", handleDrag.current);
        window.removeEventListener("mouseup", handleMouseUp.current);

    })

    if (props.className) {
        props.className = `${styles.window} ${props.className}`;
    } else {
        props.className = styles.window;
    }

    function startDrag(event: React.MouseEvent) {
        event.preventDefault();
        dragStartCoordinates.current.mouseStart = {
            x: event.clientX,
            y: event.clientY
        }
        dragStartCoordinates.current.offsetStart = {
            ...dragOffset.current
        }
        windowHeaderRef.current!.classList.add("dragging");
        window.addEventListener("mousemove", handleDrag.current);
    }

    return (
        <div ref={windowRef} {...props}>
            <div ref={windowHeaderRef} className={styles.windowHeader} onMouseDown={startDrag} style={{ transform: `translate(${dragOffset.current.x}px,  ${dragOffset.current.y}px)` }}>
                <div className={styles.windowHeaderRight}></div>
                <WindowHeaderRibbon />
                {props.title && (
                    <>
                        <div className={styles.windowTitle}>
                            {props.title}
                        </div>
                        <WindowHeaderRibbon />
                    </>
                )}
                <div className={styles.windowHeaderLeft}></div>
            </div>
            <div className={styles.windowContent}>
                {children}
            </div>
        </div>
    )
}