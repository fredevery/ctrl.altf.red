'use client';

import Image from "next/image";
import styles from "./studio.module.css";
import Page from "@/components/Page/Page";
import { useWindowResize } from "@/utilities/useWindowResize";
import Window from "@/components/Window/Window";

export default function Projects() {
    const { width, height } = useWindowResize();

    return (
        <Page className={styles.page}>
            <Window className={styles.imageWindow} title="Main Image">
                <div className={styles.imageWrapper}>
                    <img className={styles.mainImage}
                        src="https://images.pexels.com/photos/30881648/pexels-photo-30881648/free-photo-of-geometric-architectural-patterns-in-shadowed-hallway.jpeg"
                        alt="website" />
                </div>
            </Window>
            <div className={styles.infoContainer}>
                <Window className={styles.metaWindow} title="Project Meta">
                    <div className={`${styles.block} ${styles.metaBlock}`}>
                        <div className={styles.metaItem}>
                            <label className={styles.itemLabel}>Date:</label>
                            <div className={styles.metaText}>2023</div>
                        </div>
                        <div className={styles.metaItem}>
                            <label className={styles.itemLabel}>Type:</label>
                            <div className={styles.metaText}>Web Development</div>
                        </div>
                        <div className={styles.metaItem}>
                            <label className={styles.itemLabel}>Client:</label>
                            <div className={styles.metaText}>Self</div>
                        </div>
                    </div>
                </Window>
                <Window className={styles.titleWindow} title="Project Name">
                    <div className={`${styles.block} ${styles.titleBlock}`}>
                        <h1 className={styles.title}>
                            Lorem Ipsum Dolor
                        </h1>
                    </div>
                </Window>
                <div className={styles.contentWindows}>
                    <Window className={styles.infoWindow} title="Project Summary">
                        <div className={`${styles.block} ${styles.summaryBlock}`}>
                            {/* <label className={styles.blockLabel}>Summary:</label> */}
                            <div className={styles.summaryText}>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                            </div>
                        </div>
                    </Window>
                    <Window className={styles.techWindow} title="Project Tech">
                        <div className={`${styles.block} ${styles.techBlock}`}>
                            {/* <label className={styles.blockLabel}>Technologies:</label> */}
                            <div className={styles.techList}>
                                <div className={styles.techItem}>JavaScript</div>
                                <div className={styles.techItem}>CSS 3</div>
                                <div className={styles.techItem}>HTML 5</div>
                                <div className={styles.techItem}>Python</div>
                            </div>
                        </div>
                    </Window>
                </div>
            </div>
        </Page>
    )
}