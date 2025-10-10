import { ReactNode } from "react";
import styles from "./Message.module.css";

export default function MessageModal({ children }: { children: ReactNode }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4 py-6">
      <div className={styles.noteWrapper}>
        <div className={styles.sparkEmitter} aria-hidden="true">
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={index} data-index={index + 1} />
          ))}
        </div>
        <div className={styles["post-it"]}>
          <div className={styles["post-it-content"]}>{children}</div>
        </div>
      </div>
    </div>
  );
}
