'use client';

import { useState, useRef, useEffect, cache } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import styles from './Hud.module.css';
import { Nav } from '@/components';

function getVersion() {
    const startDate = new Date(1983, 6, 31); // July is month 6 (0-based)
    const now = new Date();

    let years = now.getFullYear() - startDate.getFullYear();
    let months = now.getMonth() - startDate.getMonth();

    if (now.getDate() < startDate.getDate()) {
        months -= 1; // Not a full month yet
    }

    if (months < 0) {
        years -= 1;
        months += 12;
    }

    return `${years}.${months}`;
}

const NAV_ITEMS = [
    {
        label: "Home",
    },
    {
        label: "Work",
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

function emptyBounds() {
    return {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
    }
}

function NavX() {
    const navContainerRef = useRef<HTMLDivElement>(null)
    const navRef = useRef<HTMLDivElement>(null)
    const navItemsContainerRef = useRef<HTMLDivElement>(null)
    const navItemsRef = useRef([] as HTMLDivElement[])
    const navToggleRef = useRef<HTMLDivElement>(null)
    const [showNav, setShowNav] = useState(false);
    function toggleNav() {
        setShowNav(!showNav);
    }

    const [cachedBounds, setCachedBounds] = useState({
        cached: false,
        navToggleBounds: emptyBounds(),
        navBounds: emptyBounds(),
        navItemsContainerBounds: emptyBounds(),
        navItemsBounds: [] as DOMRect[]
    })

    function cacheBounds() {
        const navToggleBounds = navToggleRef.current?.getBoundingClientRect() || emptyBounds()
        const navBounds = navRef.current?.getBoundingClientRect() || emptyBounds()
        const navItemsContainerBounds = navItemsContainerRef.current?.getBoundingClientRect() || emptyBounds()
        const navItemsBounds = navItemsRef.current.map((item) => {
            const itemBounds = item.getBoundingClientRect();
            return {
                x: itemBounds.x,
                y: itemBounds.y - navItemsContainerBounds.y,
                width: itemBounds.width,
                height: itemBounds.height
            } as DOMRect
        })


        setCachedBounds({
            cached: true,
            navToggleBounds,
            navBounds,
            navItemsContainerBounds,
            navItemsBounds
        })
    }

    useGSAP(() => {
        if (navItemsRef.current.length > 0 && !cachedBounds.cached) {
            cacheBounds();
            return;
        }

        const navHeight = showNav ? window.innerHeight * 0.25 : 0;
        const navItemHeight = cachedBounds.navItemsBounds[0].height;
        const navItemTop = navHeight / 2 - navItemHeight / 2;
        const navToggleTop = navHeight / 2 - cachedBounds.navToggleBounds.height / 2;
        const timeline = gsap.timeline({ defaults: { duration: 0.3 } });

        if (showNav) {
            timeline.to([navRef.current, '.nav-rect'], { opacity: 1, duration: 0.1, onComplete: cacheBounds })
            timeline.to([navRef.current, '.nav-rect'], { height: navHeight, onComplete: () => navRef.current?.classList.add(styles.animateBackground) })
            timeline.to(['.nav-item-rect'], { y: navItemTop }, "<")
            timeline.to(['.nav-toggle-rect'], { y: navToggleTop }, "<")
        } else {
            navRef.current?.classList.remove(styles.animateBackground)
            timeline.to([navRef.current, '.nav-rect'], { height: 0 })
            timeline.to(['.nav-item-rect'], { y: navItemTop }, "<")
            timeline.to(['.nav-toggle-rect'], { y: navToggleTop }, "<")
            timeline.to([navRef.current, '.nav-rect'], { opacity: 0, duration: 0.1 })
        }
    }, { scope: navContainerRef, dependencies: [showNav, navItemsRef, cachedBounds] })

    return (
        <nav ref={navContainerRef} className={styles.navContainer}>
            <div className={`${styles.navToggle} ${showNav ? styles.navToggled : ''}`} onClick={toggleNav} ref={navToggleRef}>
                <div className={styles.navToggleLabel}>open</div>
            </div>
            <div className={`${styles.nav} ${showNav ? styles.showNav : ''}`} ref={navRef} onTransitionEnd={cacheBounds}>
                <div className={styles.navItems} ref={navItemsContainerRef}>
                    {
                        NAV_ITEMS.map((item, index) => (
                            <div key={index}
                                className={styles.navItem}
                                ref={(el: HTMLDivElement) => { navItemsRef.current[index] = el }}>
                                {item.label}
                            </div>
                        ))
                    }
                </div>
            </div>
            <svg className={styles.svgMask}>
                <defs>
                    <mask id="nav-mask">
                        <rect
                            className="nav-rect"
                            x="0"
                            y="0"
                            width={cachedBounds.navBounds.width}
                            fill="white"
                        />
                        <rect
                            className="nav-toggle-rect"
                            x={cachedBounds.navToggleBounds.x}
                            width={cachedBounds.navToggleBounds.width}
                            height={cachedBounds.navToggleBounds.height}
                            fill="black"
                        />
                        {
                            cachedBounds.navItemsBounds.map((itemBounds, index) => (
                                <rect key={index}
                                    className="nav-item-rect"
                                    x={itemBounds.x}
                                    width={itemBounds.width}
                                    height={itemBounds.height}
                                    fill="black" />
                            ))
                        }
                    </mask>
                </defs>
            </svg>
        </nav>
    )
}

export default function Hud() {

    return (
        <div className={styles.container}>
            <div className={styles.frame}>
                <div className={styles.frameBordersTop}></div>
                <div className={styles.frameBordersBottom}></div>
                <div className={styles.frameAccentsOne}></div>
                <div className={styles.frameAccentsTwo}></div>
            </div>
            <Nav />
            <div className={styles.osDetails}>FeOS v{getVersion()}</div>
            <div className={styles.logo}>ctrl.altf.red</div>
        </div>
    )
}
