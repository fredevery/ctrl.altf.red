import styles from "./lab.module.css";
import Page from "@/components/Page/Page";

export default function Projects() {

    return (
        <Page className={styles.page}>
            {new Array(12 * 6).fill(0).map((_, index) => (<div key={`grid-block-${index}`} className={styles.block} />))}
        </Page>
    )
}