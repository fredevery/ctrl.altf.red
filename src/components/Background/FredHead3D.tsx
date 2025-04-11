'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import styles  from './Background.module.css';
import { useEffect, useRef, useState } from 'react';
import { Environment } from '@react-three/drei';

type Pixel = {
    r: number;
    g: number;
    b: number;
    a: number;
    l: number;
    x: number;
    y: number;
}
type ImageData = {
    pixels: Pixel[];
    pixelSize: number;
    width: number;
    height: number;
    loaded: boolean;
}

const X_OFFSET = -0.25;
const Y_OFFSET = 0.1;
const Y_ROTATION = 0;
const Z_ROTATION = 0;
const PIXEL_COLOR = '#666';

function loadImageData(setImageData: React.Dispatch<React.SetStateAction<ImageData>>) {
    const image = new Image();
    image.src = '/images/fred-head-small-2.jpg';

    image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        
        const context = canvas.getContext('2d');
        if (!context) throw(new Error('Failed to get canvas context'));
        context.drawImage(image, 0, 0);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        const processedPixels:Pixel[] = [];
        const imageCenterX = image.width / 2;
        const imageCenterY = image.height / 2;

        for (let y = 0; y < image.height; y++) {
            for (let x = 0; x < image.width; x++) {
                const i = (y * image.width + x) * 4;
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];
                // const a = pixels[i + 3];
                const l = (r + g + b) / 3;
                const a = l / 255;
                const pX = (x - imageCenterX) * -1;
                const pY = (y - imageCenterY) * -1;

                if (l < 50) continue; // Skip transparent pixels
                processedPixels.push({
                    r,
                    g,
                    b,
                    a,
                    l,
                    x: pX,
                    y: pY,
                });
            }
        }

        setImageData({
            pixels: processedPixels,
            pixelSize: window.innerHeight / image.height,
            width: image.width,
            height: image.height,
            loaded: true,
        });
    }
}

function Pixel3D ({ pixel, pixelSize, imageWidth, imageHeight }: { pixel: Pixel, pixelSize: number, imageWidth: number, imageHeight: number }) {
    const { viewport } = useThree();
    const pX = pixel.x / imageWidth * 15
    const pY = pixel.y / imageHeight * 15
    const size = pixelSize / viewport.height * 0.1
    // const pZ = ((pixel.l  - (256 / 2)) / 255) * 10;
    const pZ = 0

    return (
        <mesh position={[pX, pY, pZ]}>
            <boxGeometry args={[size, size, size * 0.2]} />
            <meshStandardMaterial color={PIXEL_COLOR} transparent opacity={pixel.a} />
        </mesh>
    )
}


function FredHead3DModel ({ imageData }: { imageData: ImageData }) {
    const { viewport } = useThree();
    const face = useRef<THREE.Mesh>(null);
    const rY = Y_ROTATION;
    const rZ = Z_ROTATION;
    const rX = 0;
    const gX = viewport.width * X_OFFSET;
    const gY = viewport.height * Y_OFFSET;
    console.log("gX", gX);
    // useFrame(() => {
    //     face.current.rotation.y += 0.01
    // });
    return (
        <group ref={face} rotation={[rX, rY, rZ]} position={[gX, gY, 0]}>
            {imageData.pixels.map((pixel, index) => (
                <Pixel3D key={index} pixel={pixel} pixelSize={imageData.pixelSize} imageWidth={imageData.width} imageHeight={imageData.height} />
            ))}
        </group>
    )
}

export default function FredHead3D () {
    const [ imageData, setImageData ] = useState<ImageData>({
        pixels: [],
        pixelSize: 0,
        width: 0,
        height: 0,
        loaded: false,
    });

    useEffect(() => {
        if (!imageData.loaded) {
            loadImageData(setImageData);
        } else {
            console.log(">>", imageData);
        }
    }, [imageData, setImageData])

    return (
        <div className={styles.fredHeadContainer}>
            {
                imageData.loaded ? 
                (
                    <Canvas gl={{ alpha: true }} camera={{ position: [0, 0, 10], fov: 50 }}>
                        <FredHead3DModel imageData={imageData} />
                        <directionalLight intensity={2} position={[0, 2, 3]}/>
                        <Environment preset="city" />
                    </Canvas>
                ):
                <div className={styles.loading}>Loading...</div>
            }
        </div>
    )
}