'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import useNavConfig from "./config";

export default function NavBg({ showNavBg = false }) {
    const [ initialLoad, setInitialLoad ] = useState(true);
    const navConfig = useNavConfig()
    const { 
        topBorder, 
        bottomBorder,
        navBg,
        navMask,
        navCutout,
        navFrameLeft,
        navFrameRight,
        navToggleCutout
    } = navConfig;
    const navBgRef = useRef(null);
    const navMaskRef = useRef(null);
    const innerCutoutRef = useRef(null);
    const topBorderRef = useRef(null);
    const bottomBorderRef = useRef(null);
    const innerFrameLeftRef = useRef(null);
    const innerFrameRightRef = useRef(null);

    useGSAP(() => {
        const timeline = gsap.timeline({ defaults: { duration: 0.3, ease: 'steps(12)' }});
        if (showNavBg) {
            setInitialLoad(false);
            timeline
                .fromTo([topBorderRef.current], topBorder.out, {...topBorder.in})
                .fromTo([bottomBorderRef.current], bottomBorder.out, {...bottomBorder.in}, '<')
                .fromTo([navMaskRef.current], navMask.out, {...navMask.in, delay: 0.1}, '<')
                .fromTo([innerFrameLeftRef.current], navFrameLeft.out, { ...navFrameLeft.in, duration: 0.3, delay: 0.1}, '<')
                .fromTo([innerFrameRightRef.current], navFrameRight.out, {...navFrameRight.in, duration: 0.3}, '<')
                // .fromTo([navMaskRef.current], { y: -navHeight }, { y: 0 })
        } else if (!initialLoad) {
            console.log("hiding nav bg", navMask.out);
            timeline
                .to([navMaskRef.current], {...navMask.out})
                // .to([navMaskRef.current], { y: navHeight })
                .to([topBorderRef.current], {...topBorder.out}, '<')
                .to([bottomBorderRef.current], {...bottomBorder.out}, '<')
                .to([innerFrameLeftRef.current, innerFrameRightRef.current], {...navFrameRight.out}, '<')
        } else {
            timeline
                .set([navMaskRef.current], {...navMask.out})
                // .to([navMaskRef.current], { y: navHeight })
                .set([topBorderRef.current], {...topBorder.out})
                .set([bottomBorderRef.current], {...bottomBorder.out})
                .set([innerFrameLeftRef.current, innerFrameRightRef.current], {...navFrameRight.out})
        }

    }, { scope: navBgRef, dependencies: [showNavBg, initialLoad, navConfig] });
    
    return (
        <div className="nav-background" ref={navBgRef} >
            <svg className="nav-background-svg">
                <defs>
                    <pattern id="diagonal-lines" 
                        patternUnits="userSpaceOnUse" 
                        height="100" 
                        width="100"
                        patternTransform="rotate(45)">
                            <g>
                                <path className="nav-background-stripe" d="M50,-50 v 200 M150,-50 v 200" />
                                {/* { showNavBg && (
                                    <animateTransform
                                        attributeName="transform"
                                        attributeType="XML"
                                        type="translate"
                                        from="0 0"
                                        to="-100 0"
                                        dur="5s"
                                        repeatCount="indefinite" />
                                )} */}
                            </g>
                    </pattern>
                    <mask id="nav-button-cutout-rect">
                        <rect ref={navMaskRef} fill="white" x={navBg.x} y={navBg.y} width={navBg.width} height={navBg.height} />
                        <rect ref={innerCutoutRef} fill="black" x={navCutout.x} y={navCutout.y} width={navCutout.width} height={navCutout.height} />
                        <rect fill="black" x={navToggleCutout.x} y={navToggleCutout.y} width={navToggleCutout.width} height={navToggleCutout.height} />
                    </mask>
                </defs>
                
                <rect ref={topBorderRef} x={topBorder.x} y={topBorder.y} width={topBorder.width} height={topBorder.height} fill="orange" />
                <rect ref={bottomBorderRef} x={bottomBorder.x} y={bottomBorder.y} width={bottomBorder.width} height={bottomBorder.height} fill="orange"/>
                <rect x={navBg.x} y={navBg.y} height={navBg.height} width={navBg.width} fill="url(#diagonal-lines)" mask="url(#nav-button-cutout-rect)" />
                <g ref={innerFrameLeftRef} transform={`translate(${navFrameLeft.x}, ${navFrameLeft.y})`}>
                    <polyline points={`
                        ${navFrameLeft.width},0
                        0,0
                        0,${navFrameLeft.height}
                        ${navFrameLeft.width},${navFrameLeft.height}
                    `} strokeWidth={navFrameLeft.thickness} stroke="orange" fill="none" />
                </g>
                <g ref={innerFrameRightRef} transform={`translate(${navBg.centerX - navFrameRight.width / 2}, ${navFrameRight.y})`}>
                    <polyline points={`
                        0,0
                        ${navFrameRight.width},0
                        ${navFrameRight.width},${navFrameRight.height}
                        0,${navFrameRight.height}
                    `} strokeWidth={navFrameRight.thickness} stroke="orange" fill="none" />
                </g>
            </svg>
        </div>
    )
}