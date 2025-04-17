import p5 from "p5";
import { useRef, useEffect } from "react";

// import { loadImageData, emptyImageData } from "../Background/imageLoader";
// import type { ImageData } from "../Background/imageLoader"
import { useWindowResize } from "@/utilities/useWindowResize";
import rem from "@/utilities/rem";
import { PixelGrid, ImageLoader, MousePosition, type GridPixel } from './SketchClasses';

import styles from "./FredHead.module.css";

const ZOOM = 1.8;
const X_OFFSET = -0.2;
const Y_OFFSET = -0.1;
// const MOUSE_EFFECT_RADIUS = 100;
// const MAX_MOUSE_TRAIL = 10;
// const NEIGHBOR_DISTANCE_BUFFER = 1.1;
// const MAX_MOUSE_POSITION_AGE = 40;
// const MAX_GLITCH_AGE = 60;
const FRAMERATE = 30;
const PIXEL_SIZE_REM = 1;
// const BASE_PIXEL_COLOR = "#666";

interface Renderer extends p5.Renderer {
    drawingContext: CanvasRenderingContext2D | null;
}

const fps = {
    high: 0,
    low: 1000000,
    current: 0,
    history: [] as number[],
    maxHistory: 100,
    avg: 0
}

export default function FredHeadP5() {
    const { width: windowWidth, height: windowHeight } = useWindowResize();
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const pixelSize = useRef<number>(1);
    const pixelGrid = useRef<PixelGrid>(new PixelGrid({}));
    const imageLoader = useRef<ImageLoader>(new ImageLoader({}))
    const mousePos = useRef<MousePosition>(new MousePosition())
    const fpsLabel = useRef(document.createElement('div'));
    fpsLabel.current.classList.add('fps-label');
    document.body.appendChild(fpsLabel.current);

    useEffect(() => {
        pixelSize.current = rem(PIXEL_SIZE_REM);
        imageLoader.current = new ImageLoader({
            src: "/images/fred-head-1080x1080.jpg",
            zoom: ZOOM,
            width: windowHeight,
            height: windowHeight,
            canvasWidth: windowWidth,
            canvasHeight: windowHeight,
            xOffset: X_OFFSET,
            yOffset: Y_OFFSET,
            pixelSize: pixelSize.current
        }).onLoad((imageLoader) => {
            setupSketch();
            console.log('Image loaded');
            pixelGrid.current.loadMap(imageLoader.pixelMap);
        });

        function handleMouseMove(e: MouseEvent) {
            mousePos.current.setViewPos(e.clientX, e.clientY);
        }

        document.addEventListener('mousemove', handleMouseMove)

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            imageLoader.current.destroy();
        }
    }, [windowWidth, windowHeight])

    function setupSketch() {
        const sketch = new p5((p: p5) => {
            function createCanvas() {
                const canvasEl = document.createElement('canvas');
                canvasEl.width = windowWidth;
                canvasEl.height = windowHeight;

                const ctx = canvasEl.getContext('2d', { willReadFrequently: true });
                const pCanvas = p.createCanvas(windowWidth, windowHeight, canvasEl) as Renderer;
                pCanvas.elt = canvasEl;
                pCanvas.drawingContext = ctx;
                canvasContainerRef.current!.appendChild(canvasEl);
                p.background(0, 0);
            }

            function createPixelGrid() {
                const pixelGrid = new PixelGrid({
                    p: p,
                    canvasHeight: windowHeight,
                    canvasWidth: windowWidth,
                    pixelSize: pixelSize.current
                })
                return pixelGrid;
            }

            p.setup = () => {
                pixelGrid.current = createPixelGrid();
                mousePos.current.setPixelGrid(pixelGrid.current);
                createCanvas();
                p.noStroke();
                p.frameRate(FRAMERATE);
                pixelGrid.current.draw();
            }


            p.draw = () => {
                if (mousePos.current.changed) {
                    const gridPixel = pixelGrid.current.getPixelOnGrid(mousePos.current.gridX, mousePos.current.gridY);
                    if (gridPixel) {
                        gridPixel.changeTo({
                            type: 'rect',
                            color: 'red',
                            state: 'infected'
                        })
                        gridPixel.allHealthyNeighbors.forEach((healthyNeighbor) => {
                            if (p.random([true, false])) {
                                healthyNeighbor!.changeTo({
                                    // type: 'rect',
                                    // color: 'red',
                                    state: 'infected'
                                })
                            }
                        })
                    }
                }
                mousePos.current.update();

                if (pixelGrid.current.hasPendingDraws) {
                    p.clear();

                    const infectedPixels:GridPixel[] = [];
                    const healthyPixels:GridPixel[]  = [];

                    pixelGrid.current.processChangedPixels((pixel) => {
                        pixel.allNeighbors.forEach((currentNeighbor) => {
                            const infectedNeighborsCount = currentNeighbor.allInfectedNeighbors.length;
                            if (
                                (infectedNeighborsCount === 2 && currentNeighbor.isInfected) ||
                                (infectedNeighborsCount === 3)
                            ) {
                                infectedPixels.push(currentNeighbor);
                            } else {
                                healthyPixels.push(currentNeighbor);
                            }
                        });

                        if (pixel.changeAge > FRAMERATE * 2) {
                            pixel.resetChanges();
                        }
                    }).draw();

                    infectedPixels.forEach(pixel => {
                        pixel.changeTo({
                            state: 'infected'
                        })
                    })

                    healthyPixels.forEach(pixel => {
                        pixel.resetChanges();
                    })
                }

                const frameRate = p.frameRate();
                fps.history.push(frameRate);
                if (fps.history.length > fps.maxHistory) {
                    fps.history.shift();
                }

                fps.high = Math.max(...fps.history);
                fps.low = Math.min(...fps.history);
                fps.current = frameRate;
                fps.avg = fps.history.reduce((a, b) => a + b, 0) / fps.history.length;

                fpsLabel.current.innerHTML = [
                    fps.low.toFixed(2),
                    fps.avg.toFixed(2),
                    fps.high.toFixed(2),
                    fps.current.toFixed(2),
                    pixelGrid.current.changedPixels.length,
                ].join(' | ')

            }

            p.mouseClicked = () => {
                console.log(p.frameRate());
            }
        });

        return sketch;
    }

    return (
        <div ref={canvasContainerRef} className={`${styles.fredHeadContainer} phosphorous`}></div>
    ) 
}