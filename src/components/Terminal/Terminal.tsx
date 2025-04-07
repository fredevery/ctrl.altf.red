import styles from "./Terminal.module.css";
export default function Terminal() {
    return (
        <div className={styles.container}>
            <div className={styles.prompt}>
                <div>&gt;</div>
                <div>ctrl.altf.red</div>
                <div className={styles.cursor}></div>
            </div>
        </div>
    )
}