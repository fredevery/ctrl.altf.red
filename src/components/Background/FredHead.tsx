'use client';

import { useEffect, useRef } from "react";
import { useWindowResize } from "@/utilities/useWindowResize";
import rem from "@/utilities/rem";
import p5 from "p5";
import styles from "./Background.module.css";

const VIDEO_URL = "/video/fred-head-lowQ-400x400.mp4";
const ZOOM = 2;
const REM_FACTOR = 0.5 * ZOOM;
const PIXEL_COLOR = "hsl(210, 10%, 40%)";
const PIXEL_REDUCER = 2; // to be subtracted from the pixel size
const X_OFFSET = -0; // percent of canvas width
const Y_OFFSET = -0.1; // percent of canvas height
const FRAMERATE = 10;
const VIDEO_SPEED = 1;
const SHADES = 24;
const FRAME_BUFFER_MAX = 6;
const MIN_SHADE = 50;
const CLIPS:Clip[] = [
    { name: 'looking forward', start: 0, end: 3, buffer: [], currentFrame: 0, repeatCount: 0, buffered: false, loop: 3 },
    { name: 'adjust glasses', start: 3, end: 5, buffer: [], currentFrame: 0, repeatCount: 0, buffered: false },
    { name: 'clean glasses', start: 5, end: 15, buffer: [], currentFrame: 0, repeatCount: 0, buffered: false },
    { name: 'looking around', start: 15, end: null, buffer: [], currentFrame: 0, repeatCount: 0, buffered: false }
]

interface Renderer extends p5.Renderer {
    drawingContext: CanvasRenderingContext2D | null;
}

interface Video extends p5.MediaElement {
    loadPixels: () => void;
    pixels: Uint8ClampedArray;
}

type PixelBounds = {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

type Pixel = {
    x: number;
    y: number;
    size: number;
    fillColor?: p5.Color;
    bounds: PixelBounds;
} | null

type PixelRow = Array<Pixel>

type Frame = Array<PixelRow>

type FramesBuffer = Array<Frame>

type Clip = {
    name: string,
    start: number,
    end: number | null,
    buffer: FramesBuffer,
    buffered: boolean,
    currentFrame: number,
    repeatCount: number,
    loop?: number
}

const sumArray = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
function shuffleArray<T>(arr: T[]) {
    // Create a copy so we don't mutate the original array
    const result = arr.slice();
  
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]]; // Swap
    }
  
    return result;
}

export default function FredHead() {
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const { width: windowWidth, height: windowHeight } = useWindowResize();
    useEffect(() => {
        console.log('--------------------')
        const PIXEL_SIZE = rem(REM_FACTOR, true);
        const framesBuffer:p5.Image[] = []
        const shades = new Set<number>();
        const alphas = new Set<string>();
        let playlist:Clip[] = []
        // let currentClipIndex = -1;
        let currentClip:Clip | null = null;
        let currentCueId:number | null = null;
        let frameRateModulus = 1;
        let currentFrame = 0;
        const mouseCoordinates = { x: 0, y: 0 }
        
        const myP5 = new p5((p: p5) => {
            let video: Video;
            // let videoIsPlaying = false;
            let videoZoomSize = 0;
            let videoZoomOffsetX = 0;
            let videoZoomOffsetY = 0;

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
            function handleVideoPreload() {
                videoZoomSize = Math.round(windowHeight * ZOOM);
                videoZoomOffsetX = Math.round((videoZoomSize - windowHeight - p.height * X_OFFSET) / 2);
                videoZoomOffsetY = Math.round((videoZoomSize - windowHeight - p.height * Y_OFFSET) / 2);
                video.size(videoZoomSize, videoZoomSize);
                // video.loop();
                video.volume(0);
                video.autoplay(true);
                video.speed(VIDEO_SPEED);
                // video.loop();
                video.play();
                generatePlaylist();
                cueClip();
                
                // videoIsPlaying = true;
            }

            function generatePlaylist () {
                console.log('Generating playlist')
                const loopClip = CLIPS.find((clip:Clip) => clip.loop) as Clip;
                const shuffledClips = shuffleArray(CLIPS);
                playlist = [];
                shuffledClips.forEach((clip:Clip) => {
                    playlist.push(loopClip);
                    playlist.push({...loopClip, buffer: loopClip.buffer.reverse()});
                    playlist.push(loopClip);
                    if (!clip.loop) {
                        playlist.push(clip);
                    }
                })
                console.log(playlist);
            }

            function cueClip() {
                currentClip = playlist.shift() as Clip;
                currentClip.end = currentClip.end || video.duration();
                if (currentClip.buffered) {
                    video.pause();
                    currentClip.currentFrame = 0;
                } else {
                    video.play();
                    video.time(currentClip.start);
                    if (currentCueId) video.clearCues(currentCueId);
                    currentCueId = video.addCue(currentClip.end, () => {
                        console.log("----------->", currentClip!.name, currentClip!.buffer.length);
                        currentClip!.buffered = currentClip!.buffer.length > 0;
                        cueClip();
                    })
                }
                if (playlist.length === 0)  generatePlaylist();
            }

            function mapRange(value: number, start1: number, stop1: number, start2: number, stop2: number) {
                return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
            }

            // function getBufferedPixels(framesBuffer:FramesBuffer, x: number, y: number): Pixel[] {
            //     const bufferedPixels:Pixel[] = []
            //     framesBuffer.forEach((frame: Frame) => {
            //         const pixel = frame[y][x];
            //         bufferedPixels.push(pixel);
            //     });
            //     return bufferedPixels;
            // }

            // function getDominantBufferPixel(framesBuffer:FramesBuffer, x: number, y: number): Pixel | null {
            //     let dominantPixel:Pixel | null = null;
                
            //     framesBuffer.forEach((frame: Frame) => {
            //         const pixel = frame[y][x];
            //         if (!dominantPixel || pixel && pixel.size > dominantPixel.size) {
            //             dominantPixel = pixel!; 
            //         }
            //     })
            //     return dominantPixel;
            // }

            // function shadeToAlpha(color: p5.Color, shade: number, exponent = 3.0) {
            //     // const shadeColor = p.color(shade, shade, shade);
            //     // const brightnessValue = p.brightness(shadeColor);
            //     const norm = shade / 255;
            //     const newAlpha = p.pow(norm, exponent) * 255;

            //     alphas.add(`${shade} : ${newAlpha}`);
              
            //     return p.color(p.red(color), p.green(color), p.blue(color), newAlpha);
            // }

            // function adjustShade(shade: number, shadeSet: Set<number>) {
            //     const shadeArray = Array.from(shadeSet);
            //     const minShade = Math.min(...shadeArray);
            //     const maxShade = Math.max(...shadeArray);
            //     return mapRange(shade, minShade, maxShade, MIN_SHADE, 255);
            // }

            function clampShade(shade: number) {
                return Math.max(0, Math.min(shade, 255));
            }

            function quantizeShade(shade: number) {
                const step = Math.ceil(255 / (SHADES - 1));
                return clampShade(Math.round(shade / step) * step);
            }

            function processVideoFrame() {
                const processedFrame: Frame = [];
                video.loadPixels();
                for(let y = videoZoomOffsetY; y < videoZoomOffsetY + p.height; y += PIXEL_SIZE) {
                    const rowPixels:PixelRow = [];
                    for (let x = videoZoomOffsetX; x < video.width; x += PIXEL_SIZE) {
                        const pixelOffset = Math.round(PIXEL_SIZE / 2)
                        const pixelIndex = ((x + pixelOffset) +  (y + pixelOffset) * video.width) * 4;
                        const rgb = [
                            video.pixels[pixelIndex],
                            video.pixels[pixelIndex + 1],
                            video.pixels[pixelIndex + 2]
                        ]

                        const avg = sumArray(rgb) / 3;
                        const shade = quantizeShade(avg)
                        // shades.add(shade);
                        
                        if (shade < MIN_SHADE) {
                            // rowPixels.push(null);
                            continue;
                        }
                        
                        const rectSize = mapRange(shade, 0, 255, 0, PIXEL_SIZE) - PIXEL_REDUCER;
                        const rectOffset = (PIXEL_SIZE - rectSize) / 2;
                        const top = x - videoZoomOffsetX;
                        const left = y - videoZoomOffsetY;
                        const bottom = top + PIXEL_SIZE;
                        const right = left + PIXEL_SIZE;
                        const xPos = Math.max(0, top + rectOffset);
                        const yPos = Math.max(0, left + rectOffset);

                        const fillColor = p.color(PIXEL_COLOR);
                        // fillColor.setAlpha(mapRange(shade, 0, 255, 100, 255));

                        p.fill(fillColor!);
                        p.rect(xPos, yPos, rectSize, rectSize);

                        rowPixels.push({
                            x: xPos,
                            y: yPos,
                            bounds: {
                                top, right, bottom, left
                            },
                            size: rectSize,
                            fillColor: fillColor,
                        } as Pixel)
                    }
                    processedFrame.push(rowPixels);
                }

                return processedFrame;
            }

            function getNextBufferedFrame(clip:Clip): Frame | null{
                const currentFrame = clip.currentFrame;
                const nextFrame = currentFrame + 1;
                if (nextFrame > clip.buffer.length) {
                    console.log('buffered clip ended');
                    cueClip();
                    return null;
                };
                clip.currentFrame = nextFrame;
                return clip.buffer[nextFrame];
            }

            function mouseIsInBounds ({ top, right, bottom, left }: PixelBounds) {
                const { x, y } = mouseCoordinates;
                return x > top && x < bottom && y > left && y < right
            }

            p.mouseClicked = () => {
                console.log(shades);
                console.log(alphas);
            }

            p.mouseMoved = () => {
                mouseCoordinates.x = p.mouseX;
                mouseCoordinates.y = p.mouseY;
            }
            
            p.setup = () => {
                createCanvas();
                // p.frameRate(FRAMERATE);
                p.noStroke();
                frameRateModulus = Math.floor(p.getTargetFrameRate() / FRAMERATE);
            };

            p.preload = () => {
                video = p.createVideo(VIDEO_URL, handleVideoPreload) as Video;
                video.hide();
            }

            let drawFrame: Frame | null = null;
            p.draw = () => {
                currentFrame += 1
                if (!currentClip) return;
                const isActiveFrame = currentFrame % frameRateModulus === 0
                if (isActiveFrame) {
                    console.log(currentClip.name, video.time(), currentClip.end);
                    if (currentClip!.buffered) {
                        // console.log(currentClipIndex, 'playing buffered clip');
                        drawFrame = getNextBufferedFrame(currentClip!);
                        // if (drawFrame) {
                        //     p.clear();
                        //     p.image(drawFrame, 0, 0)
                        // }
                    } else {
                        // console.log(currentClipIndex, 'playing video', video.time(), currentClip.end! - currentClip.start);
                        drawFrame = processVideoFrame();
                        // console.log("pushing frame to buffer");
                        currentClip!.buffer.push(drawFrame);
                    }
                    
                }
                
                if (drawFrame) {
                    p.clear();
                    drawFrame.forEach((row: PixelRow) => {
                        row.forEach((pixel: Pixel) => {
                            if (!pixel) return;
                            if (mouseIsInBounds(pixel.bounds)) {
                                p.fill('white');
                            } else {
                                p.fill(pixel.fillColor!);
                            }
                            p.rect(pixel.x, pixel.y, pixel.size, pixel.size);
                        });
                    });
                    if (isActiveFrame) {
                        framesBuffer.push(p.get());
                        if (framesBuffer.length > FRAME_BUFFER_MAX) framesBuffer.shift();
                    }
                    p.clear();
                    framesBuffer.forEach((frame, i) => {
                        const alpha = 255 / (FRAME_BUFFER_MAX - i)
                        p.tint(255, alpha)
                        p.image(frame, 0, 0)
                    })
                }
                // if (video.time() > currentClip!.end!) {
                    //     currentClip!.buffered = true;
                    //     currentClip!.currentFrame = 0;
                    //     currentClip!.repeatCount++;
                    //     console.log('buffered clip ended');
                    //     cueClip();
                    // }
                // }
            };

        });

        return () => {
            myP5.remove();
        };
    }, [windowHeight, windowWidth]);
    return (
        <div ref={canvasContainerRef} className={`${styles.fredHeadContainer} phosphorous`} />
    )
}