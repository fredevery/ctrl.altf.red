'use client';

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import React, { useRef, useEffect, useState } from "react";
import { usePageTransitionState } from "@/atoms/pageTransitionAtoms";
import { usePathname } from "next/navigation";
import { useWindowResize } from "@/utilities/useWindowResize";

import styles from "./LayoutCube.module.css";

type CubeOrientation = {
    rotateX: number;
    rotateY: number;
    rotateZ?: number;
}

type FacePosition = CubeOrientation & {
    translateZ: number;
}

type CubeOrientationCSS = {
    [K in keyof CubeOrientation]: string;
}

type TransitionDirection = Partial<CubeOrientation>

const UP: TransitionDirection = { rotateX: 90 };
const DOWN: TransitionDirection = { rotateX: -90 };
const LEFT: TransitionDirection = { rotateY: -90 };
const RIGHT: TransitionDirection = { rotateY: 90 };



const FACE_UP: FacePosition = {
    translateZ: 50,
    rotateX: 90,
    rotateY: 0,
}
const FACE_FRONT: FacePosition = {
    translateZ: 50,
    rotateX: 0,
    rotateY: 0,
}
const FACE_RIGHT: FacePosition = {
    translateZ: 50,
    rotateX: 0,
    rotateY: 90,
}
const FACE_BACK: FacePosition = {
    translateZ: 50,
    rotateX: 0,
    rotateY: 180,
}
const FACE_LEFT: FacePosition = {
    translateZ: 50,
    rotateX: 0,
    rotateY: 270,
}
const FACE_DOWN: FacePosition = {
    translateZ: 50,
    rotateX: 270,
    rotateY: 0,
}

const FACE_BACK_FLIP: FacePosition = {
    translateZ: 50,
    rotateX: 0,
    rotateY: 180,
    rotateZ: 180
}


// const positionToCSSUnits = (position:FacePosition) => {
//     return {
//         // translateX: `${position.translateX}vw`,
//         // translateY: `${position.translateY}vw`,
//         translateZ: `${position.translateZ}vw`,
//         rotateX: `${position.rotateX}deg`,
//         rotateY: `${position.rotateY}deg`,
//     }
// }

const addRotations = (
    rotationA: TransitionDirection,
    rotationB: TransitionDirection
): TransitionDirection => {
    return {
        rotateX: (rotationA.rotateX || 0) + (rotationB.rotateX || 0),
        rotateY: (rotationA.rotateY || 0) + (rotationB.rotateY || 0),
    }
}

const positionToCSS = (position: FacePosition): React.CSSProperties => {
    return {
        transform: `
            rotateY(${position.rotateY}deg)
            rotateX(${position.rotateX}deg)
            rotateZ(${position.rotateZ || 0}deg)
            translateZ(${position.translateZ}vw)
        `
    }
}

const orientationToCSSUnits = (orientation: Partial<CubeOrientation>): CubeOrientationCSS => {
    return {
        rotateX: `${orientation.rotateX || 0}deg`,
        rotateY: `${orientation.rotateY || 0}deg`,
    }
}

// const orientationToCSS = (orientation: Partial<CubeOrientation>): React.CSSProperties => {
//     return {
//         transform: `
//             rotateY(${orientation.rotateY || 0}deg)
//             rotateX(${orientation.rotateX || 0}deg)
//         `
//     }
// }

let directions: TransitionDirection[] = [];
function getTransitionDirection(): TransitionDirection {
    if (!directions.length) {
        directions = [UP, DOWN, LEFT, RIGHT].sort(() => Math.random() - 0.5);
    }
    return directions.pop() as TransitionDirection;
}

let faces: FacePosition[] = [];
function getRandomFace(currentCubeOrientation: CubeOrientation): [FacePosition, TransitionDirection] {
    if (!faces.length) {
        faces = [FACE_LEFT, FACE_RIGHT, FACE_UP, FACE_DOWN, FACE_FRONT, FACE_BACK].sort(() => Math.random() - 0.5);
    }
    const { rotateX, rotateY } = currentCubeOrientation;
    const randomFace = faces.pop() as FacePosition;
    const randomFaceOrientation = {
        rotateX: randomFace.rotateX ? randomFace.rotateX + Math.floor(rotateX / randomFace.rotateX) * 360 : randomFace.rotateX + 360,
        rotateY: randomFace.rotateY ? randomFace.rotateY + Math.floor(rotateY / randomFace.rotateY) * 360 : randomFace.rotateY + 360,
    }

    console.log("====== RANDOM FACE =====")
    console.log("randomFace", randomFace)
    console.log("orientation", randomFaceOrientation);
    console.log("currentCubeOrientation", { rotateX, rotateY });

    return [randomFace, randomFaceOrientation] as [FacePosition, TransitionDirection];
}

function getClosestFace(orientation: CubeOrientation): [FacePosition, TransitionDirection] {
    const { rotateX, rotateY } = orientation;
    const normalizedXRotation = (rotateX + 360) % 360;
    const normalizedYRotation = (rotateY + 360) % 360;
    const filteredFaces = [FACE_LEFT, FACE_RIGHT, FACE_UP, FACE_DOWN, FACE_FRONT, FACE_BACK]
        .filter((face) => {
            return face.rotateX > normalizedXRotation + 90 || face.rotateY > normalizedYRotation + 90;
        })
    const sortedFaces = filteredFaces.sort((faceA, faceB) => {
        const distanceA = Math.abs(faceA.rotateX - rotateX) + Math.abs(faceA.rotateY - rotateY);
        const distanceB = Math.abs(faceB.rotateX - rotateX) + Math.abs(faceB.rotateY - rotateY);
        return distanceA - distanceB;
    })
    const closestFace = { ...sortedFaces[0] };
    const closestFaceOrientation = {
        rotateX: closestFace.rotateX,
        rotateY: closestFace.rotateY,
    }
    console.log("====== CLOSEST FACE =====")
    console.log(filteredFaces, sortedFaces)
    console.log("orientation", orientation);
    console.log("closestFace", closestFace);
    return [closestFace, closestFaceOrientation] as [FacePosition, TransitionDirection];
}

function CubeFace({
    children,
    position
}: Readonly<{
    children?: React.ReactNode;
    position: FacePosition;
}>) {
    const faceRef = useRef<HTMLDivElement>(null);
    const facePosition = positionToCSS(position);

    return (
        <div ref={faceRef}
            className={styles.cubeFace}
            style={facePosition}>
            {children}
        </div>
    )
}

function GridBackground() {
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

export default function LayoutCube({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    const mountedPathname = useRef<string | null>(null);
    const cubeTranslateRef = useRef<HTMLDivElement>(null);
    const cubeRef = useRef<HTMLDivElement>(null);
    const currentCubeOrientation = useRef<CubeOrientation>({
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0
    });
    const directionRef = useRef<TransitionDirection>(UP);
    const [renderFace, setRenderFace] = useState<FacePosition>(FACE_FRONT);
    const [showChildren, setShowChildren] = useState(true);
    const pathname = usePathname();

    const pageTransitionState = usePageTransitionState();

    const spinCubeRef = useRef(function spinCube() {
        if (pageTransitionState.isEnter()) return;
        const { rotateX, rotateY } = currentCubeOrientation.current;
        currentCubeOrientation.current = {
            rotateX: rotateX + 1,
            rotateY: rotateY + 1,
        }
        gsap.set(cubeRef.current, currentCubeOrientation.current);
    })

    useEffect(() => {
        if (mountedPathname.current === pathname) return;
        mountedPathname.current = pathname;
        if (pageTransitionState.isExitComplete()) {
            pageTransitionState.setToEnter();
        }
    }, [pageTransitionState, pathname])

    useGSAP(() => {
        console.log("STATE >>>", pageTransitionState.state);
        if (pageTransitionState.isComplete()) {
            currentCubeOrientation.current = {
                rotateY: 0,
                rotateX: 0,
                rotateZ: 0
            }
            gsap.set(cubeRef.current, currentCubeOrientation.current);
            setRenderFace(FACE_FRONT);
            pageTransitionState.setToIdle();
            return;
        };

        const timeline = gsap.timeline({
            defaults: {
                duration: 0.5,
                ease: "power2.inOut",
            },
        });

        if (pageTransitionState.isExit()) {
            directionRef.current = getTransitionDirection();
            timeline.to(cubeTranslateRef.current, {
                translateZ: "-250vw",
                onComplete: () => {
                    setShowChildren(false);
                    gsap.ticker.add(spinCubeRef.current);
                    pageTransitionState.setToExitComplete();
                }
            })
            currentCubeOrientation.current = {
                rotateX: Math.random() * 60 + 30,
                rotateY: Math.random() * 60 + 30,
            }
            timeline.to(cubeRef.current, {
                ...currentCubeOrientation.current,
                onComplete: () => {
                    gsap.ticker.add(spinCubeRef.current);

                }
            }, "<")
            // timeline.to(cubeRef.current, {
            //     ...orientationToCSSUnits(directionRef.current),
            //     onComplete: () => {
            //         pageTransitionState.setToExitComplete();
            //         if (directionRef.current === UP || directionRef.current === DOWN) {
            //             setRenderFace(FACE_BACK_FLIP);
            //         } else {
            //             setRenderFace(FACE_BACK);
            //         }
            //     }
            // });
        }

        if (pageTransitionState.isEnter()) {
            const [randomFace, randomFaceOrientation] = getClosestFace(currentCubeOrientation.current);
            setRenderFace(randomFace);
            gsap.ticker.remove(spinCubeRef.current);
            timeline.to(cubeRef.current, {
                ...orientationToCSSUnits(randomFaceOrientation),
                duration: 1,
                onComplete: () => setShowChildren(true)
            });
            timeline.to(cubeTranslateRef.current, {
                translateZ: "-50vw",
                onComplete: () => {
                    pageTransitionState.setToComplete();
                }
            });
        }
    }, { scope: cubeTranslateRef, dependencies: [pageTransitionState.state] });

    return (
        <>
            <div ref={cubeTranslateRef} className={styles.cubeTranslate}>
                <div ref={cubeRef} className={`${styles.cube} ${pageTransitionState.isIdle() ? '' : styles.cubeTransitioning}`}>
                    {showChildren ? (
                        <CubeFace position={renderFace}>
                            {children}
                        </CubeFace>
                    ) : (
                        <>
                            <CubeFace key="face-front" position={FACE_FRONT} />
                            <CubeFace key="face-back" position={FACE_BACK} />
                        </>
                    )}
                    <CubeFace key="face-left" position={FACE_LEFT} />
                    <CubeFace key="face-right" position={FACE_RIGHT} />
                    <CubeFace key="face-up" position={FACE_UP} />
                    <CubeFace key="face-down" position={FACE_DOWN} />
                </div>
            </div>
            <GridBackground />
        </>
    )
}