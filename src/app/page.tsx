'use client';
import { useAtom } from "jotai";
import dynamic from "next/dynamic";

import { pageTransitionAtom } from "@/atoms/pageTransitionAtoms";
import Page from "@/components/Page/Page";

const FredHead = dynamic(() => import("@/components/FredHead/FredHeadP5"), { ssr: false });

import styles from "./page.module.css";
export default function Home() {
  const transitioning = useAtom(pageTransitionAtom)[0];
  return (
    <Page className={styles.homePage}>
      {/* <Window /> */}
      {!transitioning && <FredHead />}
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
    </Page>
  );
}
