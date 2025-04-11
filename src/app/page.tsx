import styles from "./page.module.css";
// import { Window } from "@/components";

export default function Home() {
  return (
    <div className={styles.homePage}>
      {/* <Window /> */}
      <div className={`${styles.pageTitle} phosphorous`}>
        <div className={styles.pageTitleMain}>
          <span className={styles.titlePart}>ctrl</span>
          <span className={styles.titlePart}>altf</span>
          <span className={styles.titlePart}>red</span>
        </div>
        <div className={styles.pageTitleSub}>
          &lt; portfolio of fred every /&gt;
        </div>
      </div>
    </div>
  );
}
