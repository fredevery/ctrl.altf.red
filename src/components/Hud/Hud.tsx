'use client';

import './Hud.css';
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

export default function Hud() {

    return (
        <div className="hud">
            <div className="frame">
                <div className="borders-top"></div>
                <div className="borders-bottom"></div>
                <div className="accents-one"></div>
                <div className="accents-two"></div>
            </div>
            <Nav />
            <div className="os-details">FeOS v{getVersion()}</div>
            <div className="hud-logo">ctrl.altf.red</div>
        </div>
    )
}
