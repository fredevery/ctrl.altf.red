'use client';

import { loadImageData, emptyImageData } from "./imageLoader"
import type { ImageData, Pixel } from "./imageLoader"
import { Stage, Layer, Rect, Circle, Text } from "react-konva";
import { useWindowResize } from "@/utilities/useWindowResize";
import { useEffect, useRef, useState } from "react";

import styles from "./Background.module.css";
import { useAnimationFrame } from "@/utilities/useAnimationFrame";
const REPULSION_RADIUS = 100;
const ZOOM = 2;
// const FORCE = 10;

const mouseCoordinates = { x: 0, y: 0 };

function Pixels({ imageData }: { imageData: ImageData }) {
    const {
        width: windowWidth,
        height: windowHeight,
        centerX: windowCenterX,
        centerY: windowCenterY
    } = useWindowResize();

    const [imagePixels, setImagePixels] = useState<Pixel[]>([]);
    const mouseCoordinatesRef = useRef({ ...mouseCoordinates, changed: false });
    const prevMouseCoordinatesRef = useRef(mouseCoordinates);
    const allPixelsAtRest = useRef(true);
    const imagePixelsRef = useRef<Pixel[]>([]);
    const firstPixelTouched = useRef(0);

    useEffect(() => {
        imagePixelsRef.current = imageData.pixels.map(pixel => {
            const x = Math.floor(
                pixel.x * imageData.pixelSize + Math.floor(windowCenterX - imageData.width * imageData.pixelSize / 2) + 1 - (windowWidth * 0.25)
            );
            const y = Math.floor(
                pixel.y * imageData.pixelSize + Math.floor(windowCenterY - imageData.height * imageData.pixelSize / 2) + 1 - (windowHeight * 0.05)
            );
            return {
                ...pixel,
                x, y,
                baseX: x, baseY: y,
                size: imageData.pixelSize - 2,
                char: getPixelChar(pixel),
                glitching: false
            }
        }).filter(pixel => pixel.x > 0 && pixel.x < windowWidth && pixel.y > 0 && pixel.y < windowHeight);
        setImagePixels([...imagePixelsRef.current]);
    }, [imageData, windowCenterX, windowCenterY, windowWidth, windowHeight]);

    // function processPixels() {
        // const cX = 450;
        // const cY = 500;
        // allPixelsAtRest.current = true;
    //     const processedPixels = imagePixels.map((pixel) => {
    //         // if (!pixel.repulsed) {
    //         //     if (pixel.x < cX - 20 || pixel.x > cX + 20) return pixel;
    //         //     if (pixel.y < cY - 20 || pixel.y > cY + 20) return pixel;
    //         // }
    //         // pixel.r = 255;
    //         // pixel.g = 0;
    //         // pixel.b = 255;
    //         // pixel.a = 1;
    //         const dx = pixel.baseX - mouseCoordinates.x;
    //         const dy = pixel.baseY - mouseCoordinates.y;
    //         const dist = Math.sqrt(dx * dx + dy * dy);
    //         pixel.repulsed = true;
    //         if (dist < REPULSION_RADIUS) {
    //             const angle = Math.atan2(dy, dx);
    //             const repelX = Math.cos(angle) * FORCE;
    //             const repelY = Math.sin(angle) * FORCE;
    //             allPixelsAtRest.current = false;
    //             const targetX = pixel.x + repelX;
    //             const targetY = pixel.y + repelY;
    //             const newX = Math.min(Math.max(targetX, pixel.baseX - REPULSION_RADIUS / 2), pixel.baseX + REPULSION_RADIUS / 2);
    //             const newY = Math.min(Math.max(targetY, pixel.baseY - REPULSION_RADIUS / 2), pixel.baseY + REPULSION_RADIUS / 2);
    //             return {
    //                 ...pixel,
    //                 x: newX,
    //                 y: newY,
    //             };
    //         } else if (
    //             pixel.x !== pixel.baseX ||
    //             pixel.y !== pixel.baseY
    //         ) {
    //             // slowly return to original position
    //             const ox = pixel.baseX - pixel.x;
    //             const oy = pixel.baseY - pixel.y;
    //             const newX = Math.abs(ox) < 0.1 ? pixel.baseX : pixel.x + ox * 0.1;
    //             const newY = Math.abs(oy) < 0.1 ? pixel.baseY : pixel.y + oy * 0.1;
    //             allPixelsAtRest.current = false;
    //             return {
    //                 ...pixel,
    //                 x: newX,
    //                 y: newY,
    //             };
    //         } else {
    //             pixel.repulsed = false;
    //             return pixel;
    //         }
    //     });
    //     setImagePixels(processedPixels);
    // }

    function getRandomLuminance() {
        const min = 0;
        const max = 255;
        const randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
        return randomValue;
    }

    function processPixels() {
        allPixelsAtRest.current = true;
        setImagePixels((prevPixels) => imagePixelsRef.current.map((pixel, index) => {
            const dx = pixel.baseX - mouseCoordinatesRef.current.x;
            const dy = pixel.baseY - mouseCoordinatesRef.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            pixel.repulsed = true;
            const prevPixel = prevPixels[index];
            if (dist < REPULSION_RADIUS) {
                firstPixelTouched.current = index;
                allPixelsAtRest.current = false;
                return {
                    ...pixel,
                    // a: 0
                    r: 255,
                    g: 0,
                    b: 255,
                    fontStyle: "bold",
                    l: getRandomLuminance(),
                    glitching: true                }
            // } else if (pixel.r !== prevPixel.r || pixel.g != prevPixel.g || pixel.b != prevPixel.b) {
            } else if (pixel.l !== prevPixel.l) {
                const dA = pixel.l - prevPixel.l;
                const dR = pixel.r - prevPixel.r;
                const dG = pixel.g - prevPixel.g;
                const dB = pixel.b - prevPixel.b;
                const newR = Math.abs(dR) < 0.1 ? pixel.r : prevPixel.r + dR * 0.1;
                const newG = Math.abs(dG) < 0.1 ? pixel.g : prevPixel.g + dG * 0.1;
                const newB = Math.abs(dB) < 0.1 ? pixel.b : prevPixel.b + dB * 0.1;
                const newA = Math.abs(dA) < 0.1 ? pixel.l : prevPixel.l + dA * 0.1;
                allPixelsAtRest.current = false;
                if (index === firstPixelTouched.current) console.log(">>", dA, newA);
                return {
                    ...prevPixel,
                    fontStyle: "bold",
                    l: newA,
                    r: newR,
                    g: newG,
                    b: newB,
                }
            } else {
                return pixel;
            }
        }))
    }

    useAnimationFrame(() => {
        const { changed } = mouseCoordinatesRef.current;
        if (changed || !allPixelsAtRest.current) {
            processPixels();
            mouseCoordinatesRef.current.changed = false;
        }
    });

    useEffect(() => {
        function handleMouseMove(event: MouseEvent) {
            const { x: prevX, y: prevY } = prevMouseCoordinatesRef.current;
            const { clientX: x, clientY: y } = event;
            mouseCoordinatesRef.current.x = x;
            mouseCoordinatesRef.current.y = y;
            if (prevX != x || prevY != y) {
                mouseCoordinatesRef.current.changed = true;
            }
            prevMouseCoordinatesRef.current.x = x;
            prevMouseCoordinatesRef.current.y = y;
        }
        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    })

    const asciiStrip = ".'`^\",:;Il!i~+_-?][}{1)(|\\/*tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
    const mapRange = (value: number, start1: number, stop1: number, start2: number, stop2: number) => {
        return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    }

    function getPixelChar(pixel: Pixel) {
        const charIndex = Math.floor(mapRange(pixel.l, 0, 255, 0, asciiStrip.length - 1));
        return asciiStrip.charAt(charIndex);
        
    }

    function getRandomPixelChar() {
        const charIndex = Math.floor(Math.random() * asciiStrip.length);
        return asciiStrip.charAt(charIndex);
    }

    return (
        <>
            {imagePixels.map((pixel, index) => (
                // <Rect
                //     key={index}
                //     x={pixel.x}
                //     y={pixel.y}
                //     width={pixel.size}
                //     height={pixel.size}
                //     fill={`rgba(${pixel.r}, ${pixel.g}, ${pixel.b}, ${pixel.a})`}
                // />
                <>
                {pixel.glitching && (
                    <Rect
                        key={`rect-${index}`}
                        x={pixel.x}
                        y={pixel.y}
                        width={pixel.size}
                        height={pixel.size}
                        fill={`hsl(30, 100%, 40%)`} />
                )}
                <Text 
                    text={getPixelChar(pixel)} 
                    key={`char-${index}`} 
                    x={pixel.x} 
                    y={pixel.y} 
                    fontSize={pixel.size}
                    fontStyle={pixel.fontStyle || "normal"}
                    fontFamily="baseMonoFont"
                    fill={pixel.glitching ? 'white' : `rgba(${pixel.r}, ${pixel.g}, ${pixel.b}, 1)`} />
                </>
            ))}
        </>
    )

}

function CanvasHelpers() {
    const {
        width: windowWidth,
        height: windowHeight,
        centerX: windowCenterX,
        centerY: windowCenterY
    } = useWindowResize();

    const [mouseCoordinates, setMouseCoordinates] = useState({ x: 0, y: 0 });
    const handleMouseMove = (event: MouseEvent) => {
        const { clientX: x, clientY: y } = event;
        setMouseCoordinates({ x, y });
    }
    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    });

    return (
        <>
            <Rect x={windowCenterX - 1} y={0} width={2} height={windowHeight} fill="magenta" />
            <Rect x={windowWidth * 0.25 - 1} y={0} width={2} height={windowHeight} fill="magenta" />
            <Rect x={windowWidth * 0.75 - 1} y={0} width={2} height={windowHeight} fill="magenta" />
            <Rect x={0} y={windowCenterY - 1} width={windowWidth} height={2} fill="magenta" />
            <Circle
                x={mouseCoordinates.x}
                y={mouseCoordinates.y}
                radius={REPULSION_RADIUS}
                stroke="red" />
        </>
    )
}

export default function FredHeadKonva() {
    const {
        width: windowWidth,
        height: windowHeight,
    } = useWindowResize();
    const [imageData, setImageData] = useState<ImageData>(emptyImageData());



    if (!imageData.loaded) {
        loadImageData("/images/fred-head-small.png", (imageData) => {
            setImageData(imageData);
        }, { zoom: ZOOM });
    }
    return (
        <Stage className={`${styles.fredHeadContainer} phosphorous`} width={windowWidth} height={windowHeight} style={{ backgroundColor: "transparent" }}>
            <Layer>
                {(imageData.loaded && (<Pixels imageData={imageData} />))}
            </Layer>
            {/* <Layer>
                <CanvasHelpers />
            </Layer> */}
        </Stage>
    )
}