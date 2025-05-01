'use client';

import dynamic from 'next/dynamic';
import { useState, useRef, useEffect } from 'react';

import Tape from "@/assets/svgs/tape.svg";
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import TransitionLink from '@/components/TransitionLink/TransitionLink';

import "./Nav.css";

const NavBg = dynamic(() => import("./NavBg"), { ssr: false })

const NAV_ITEMS = [
    {
        label: "Home",
        href: "/"
    },
    {
        label: "Studio",
        href: "/studio"
    },
    {
        label: "Lab",
        href: "/lab"
    },
    // {
    //     label: "Blog"
    // },
    {
        label: "Whoami",
        href: "/whoami"
    },
]

export default function Nav() {
    const navRef = useRef(null);
    const [showNav, setShowNav] = useState(false);
    const [showNavBg, setShowNavBg] = useState(false);
    const [showNavItems, setShowNavItems] = useState(false);
    const showNavItemsTimeout = useRef<NodeJS.Timeout>(null);
    useEffect(() => {
        if (!showNav) {
            setShowNavBg(false);
            setShowNavItems(false);
            if (showNavItemsTimeout.current) {
                clearTimeout(showNavItemsTimeout.current);
            }
        } else {
            setShowNavBg(true);
            setShowNavItems(true);
            // showNavItemsTimeout.current = setTimeout(() => { setShowNavItems(true) }, 300);
        }

    }, [showNav])

    function toggleNav() {
        setShowNav(!showNav);
    }

    useGSAP(() => {
        gsap.to(['.nav-item'], {
            opacity: showNavItems ? 1 : 0,
            ease: showNavItems ? 'bounce.in' : 'bounce.out',
            duration: 0.2,
            stagger: showNavItems ? { each: 0.1, from: 'random' } : undefined
        })
    }, { scope: navRef, dependencies: [showNavItems] })

    return (
        <>
            <div className={`nav-toggle ${showNav ? "nav-toggled" : ''} phosphorous`} onClick={toggleNav}>
                <div className="nav-toggle-label">open</div>
            </div>
            <nav className={`nav ${showNavBg ? "nav-open" : ''}`} ref={navRef} inert={showNav ? undefined : true}>
                <div className="nav-container">
                    <div className="nav-content">
                        {/* <div className="nav-logo">ctrl.altf.red</div> */}
                        <div className="nav-items phosphorous">
                            {
                                NAV_ITEMS.map((item, index) => (
                                    <TransitionLink key={index}
                                        className="nav-item"
                                        href={item.href}
                                        onClick={() => setShowNav(false)}>
                                        <div className="nav-item-icon">
                                            <Tape className="icon-svg" />
                                        </div>
                                        <div className="nav-item-label">
                                            {item.label}
                                        </div>
                                    </TransitionLink>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </nav>
            <NavBg showNavBg={showNavBg} />
        </>
    )
}