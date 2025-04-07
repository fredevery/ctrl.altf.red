import styles from "./EffectsOverlay.module.css";

export default function EffectsOverlay() {
    return (
        <div className={styles.container}>
            <div className={styles.grid}></div>
            <div className={styles.frame}></div>
            <div className={`${styles.phosphorlines} ${styles.fullscreen}`}></div>
        </div>
    )
}