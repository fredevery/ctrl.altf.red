'use client';

import { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import styles from "./Nav.module.css";
import Tape from "@/assets/svgs/tape.svg";

const NAV_ITEMS = [
    // {
    //     label: "Home",
    // },
    {
        label: "Work",
    },
    {
        label: "Projects",
    },
    {
        label: "Blog"
    },
    {
        label: "About",
    },
    {
        label: "Contact",
    },
]

export default function Nav() {
    const navRef = useRef(null);
    const navInnerCutoutRef = useRef(null);
    const navToggleCutoutRef = useRef(null);
    const navCornerTopLeftRef = useRef(null);
    const navCornerTopRightRef = useRef(null);
    const navCornerBottomRightRef = useRef(null);
    const navCornerBottomLeftRef = useRef(null);


    const [showNav, setShowNav] = useState(false);
    function toggleNav() {
        setShowNav(!showNav);
    }

    useGSAP(() => {
        const timeline = gsap.timeline({ defaults: { duration: 0.4, ease: 'circ.in' }});
        const { innerHeight, innerWidth } = window;
        const navBgWidth = innerWidth - 32;
        const navHeight = Math.round(innerHeight * 0.5);
        const navBgHeight = navHeight - 32;
        const verticalPadding = Math.round(innerHeight * 0.1);
        const horizontalPadding = Math.round(navBgWidth * 0.2);
        const cutoutHeight = Math.round(navBgHeight - verticalPadding * 2);
        const cutoutWidth = Math.round(navBgWidth - horizontalPadding * 2);

        if (showNav) {

            console.log(cutoutHeight, cutoutWidth)
            timeline.set([navCornerTopLeftRef.current], {
                x: horizontalPadding + 2 * 16,
                y: verticalPadding + 2 * 16,
                opacity: 0
            })
            timeline.set([navCornerTopRightRef.current], {
                x: navBgWidth - (horizontalPadding + 4 * 16),
                y: verticalPadding + 2 * 16,
                opacity: 0
            })
            timeline.set([navCornerBottomRightRef.current], {
                x: navBgWidth - (horizontalPadding + 4 * 16),
                y: navBgHeight - (verticalPadding + 4 * 16),
                opacity: 0
            })
            timeline.set([navCornerBottomLeftRef.current], {
                x: horizontalPadding + 2 * 16,
                y: navBgHeight - (verticalPadding + 4 * 16),
                opacity: 0
            })
            timeline.set([navInnerCutoutRef.current], { 
                x: navBgWidth * 0.5,
                y: verticalPadding,  
                height: cutoutHeight,
                width: 0 
            })
            timeline.set('.nav-item', { opacity: 0 })

            timeline.to([navRef.current], { height: navHeight })
            timeline.to([navToggleCutoutRef.current], { y: navBgHeight * 0.5 }, "<")
            timeline.to([navInnerCutoutRef.current], { width: cutoutWidth, x: horizontalPadding, duration: 0.3, delay: 0.2 }, "<")
            timeline.to([
                navCornerTopLeftRef.current,
                navCornerTopRightRef.current,
                navCornerBottomRightRef.current,
                navCornerBottomLeftRef.current
            ], {
                opacity: 1,
                ease: 'bounce.in',
                duration: 0.3,
                stagger: {
                    each: 0.05,
                    from: "random"
                }
            })
            timeline.to('.nav-item', {
                opacity: 1,
                ease: 'bounce.in',
                duration: 0.3,
                stagger: {
                    each: 0.05,
                    from: 'random'
                }
            }, "<")
        } else {
            timeline.to('.nav-item', {
                opacity: 0,
                ease: 'bounce.in',
                duration: 0.5,
                // duration: 0.1,
                stagger: {
                    each: 0.05,
                    from: 'random'
                }
            })
            timeline.to([
                navCornerTopLeftRef.current,
                navCornerTopRightRef.current,
                navCornerBottomRightRef.current,
                navCornerBottomLeftRef.current
            ], {
                opacity: 0,
                ease: 'bounce.in',
                duration: 0.5,
                // duration: 0.1,
                stagger: {
                    each: 0.05,
                    from: "random"
                }
            }, "<")
            timeline.to([navInnerCutoutRef.current], { width: 0, x: navBgWidth * 0.5, duration: 0.3 })
            timeline.to([navRef.current], { height: 0, delay: 0.2}, "<")
            timeline.to([navToggleCutoutRef.current], { y: 0 }, "<")
        }
    }, { scope: navRef, dependencies: [showNav] })

    return (
        <>
        <div className={`${styles.navToggle} ${showNav ? styles.navToggled : ''}`} onClick={toggleNav}>
            <div className={styles.navToggleLabel}>open</div>
        </div>
        <nav className={`${styles.nav} ${showNav ? styles.navOpen : ''}`} ref={navRef}>
            <div className={styles.navItems}>
                {
                    NAV_ITEMS.map((item, index) => (
                        <div key={index}  className={`${styles.navItem} nav-item`}>
                            <div className={styles.navItemIcon}>
                                <Tape />
                            </div>
                            <div className={styles.navItemLabel}>
                                {item.label}
                            </div>
                        </div>
                    ))
                }
            </div>
            <div className={styles.navBackground}>
                <svg>
                    <defs>
                        <pattern id="diagonal-lines" 
                            patternUnits="userSpaceOnUse" 
                            height="100" 
                            width="100"
                            patternTransform="rotate(45)">
                                <g>
                                    <path className={styles.navBackgroundStripe} d="M50,-50 v 200 M150,-50 v 200" />
                                    {/* <animateTransform
                                        attributeName="transform"
                                        attributeType="XML"
                                        type="translate"
                                        from="0 0"
                                        to="-100 0"
                                        dur="5s"
                                        repeatCount="indefinite" /> */}
                                </g>
                        </pattern>
                        <mask id="nav-button-cutout-rect">
                            <rect x="0" y="0" width="100%" height="100%" fill="white" />
                            <rect fill="black" ref={navInnerCutoutRef} />
                            <rect fill="black" x="0" y="-3rem" width="5rem" height="6rem" ref={navToggleCutoutRef} />
                        </mask>
                    </defs>

                    <rect x="0" y="0" height="100%" width="100%" fill="url(#diagonal-lines)" mask="url(#nav-button-cutout-rect)" />
                    <rect className={styles.innerFrameTopLeft} ref={navCornerTopLeftRef} />
                    <rect className={styles.innerFrameTopRight} ref={navCornerTopRightRef} />
                    <rect className={styles.innerFrameBottomRight} ref={navCornerBottomRightRef} />
                    <rect className={styles.innerFrameBottomLeft} ref={navCornerBottomLeftRef} />
                </svg>
            </div>
        </nav>
        </>
    )
}