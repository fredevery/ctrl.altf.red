'use client';

import styles from "./Background.module.css";
import dynamic from "next/dynamic";
import Grid from "./Grid";
const FredHead = dynamic(() => import("./FredHeadKonva"), { ssr: false });

export default function Background() {
    return (
        <div className={styles.background}>
            <FredHead />
            <Grid />
        </div>
    )
}