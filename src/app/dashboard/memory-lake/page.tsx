import styles from "./LakeScene.module.css";

export default function Home() {
  return (
    <section className={styles.landscape}>
      {/* mountains */}
      <div className={`${styles.mountain} ${styles["mountain-1"]}`}></div>
      <div className={`${styles.mountain} ${styles["mountain-2"]}`}></div>
      <div className={`${styles.mountain} ${styles["mountain-3"]}`}></div>
      <div
        className={`${styles["sun-container"]} ${styles["sun-container-1"]}`}></div>

      <div className={styles["sun-container"]}>
        <div className={styles.sun}></div>
      </div>

      {/* clouds */}
      <div className={styles.cloud}></div>
      <div className={`${styles.cloud} ${styles["cloud-1"]}`}></div>

      {/* sun reflection */}
      <div
        className={`${styles["sun-container"]} ${styles["sun-container-reflection"]}`}>
        <div className={styles.sun}></div>
      </div>

      <div className={styles.water}></div>

      {/* splash 1 */}
      <div className={styles.splash}></div>
      <div className={`${styles.splash} ${styles["delay-1"]}`}></div>
      <div className={`${styles.splash} ${styles["delay-2"]}`}></div>

      {/* splash 2 */}
      <div
        className={`${styles.splash} ${styles["splash-2"]} ${styles["delay-2"]}`}></div>
      <div
        className={`${styles.splash} ${styles["splash-2"]} ${styles["delay-3"]}`}></div>
      <div
        className={`${styles.splash} ${styles["splash-2"]} ${styles["delay-4"]}`}></div>

      {/* big splash */}
      <div
        className={`${styles.splash} ${styles["splash-stone"]} ${styles["delay-3"]}`}></div>
      <div
        className={`${styles.splash} ${styles["splash-stone"]} ${styles["splash-2"]}`}></div>
      <div
        className={`${styles.splash} ${styles["splash-stone"]} ${styles["splash-2"]}`}></div>

      {/* lotuses */}
      <div className={`${styles.lotus} ${styles["lotus-1"]}`}></div>
      <div className={`${styles.lotus} ${styles["lotus-2"]}`}></div>
      <div className={`${styles.lotus} ${styles["lotus-3"]}`}></div>

      <div className={styles["land-container"]}>
        <div className={styles.land}></div>

        <div className={styles.grass}></div>

        <div className={styles["grass-2"]}></div>
        <div className={styles["grass-3"]}></div>
        <div className={styles.reed}></div>
      </div>

      {/* bottle */}

      <button
        type="button"
        className={`${styles.washedBottle} ${styles.washedBottleActive}`}
        aria-label="Open the washed-up bottle">
        <div className={styles.bottleGlass}>
          <div className={styles.bottleHighlight} />
          <div className={styles.bottleShadow} />
        </div>
        <div className={styles.bottleCork} />
        <div className={styles.bottleScroll} />
      </button>

      <div className={styles["dirt-mask"]}></div>
    </section>
  );
}
