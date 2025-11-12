"use client";

import { ArrowUp, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import MessageModal from "@/components/MessageModal";
import { NoteLakeCreateModal } from "@/components/memory-lake/NoteLakeCreateModal";
import styles from "./LakeScene.module.css";
import { useDailyBottle } from "@/hooks/useDailyBottle";

export function NoteLakeClient() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { isSignedIn } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [dailyOpen, setDailyOpen] = useState(false);
  const {
    dailyBottle,
    isLoading: isLoadingBottle,
    isDeleting: isDeletingBottle,
    error: BottleError,
    refetch: refetchBottle,
    deleteBottle,
  } = useDailyBottle();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = isMuted;
    audio.volume = volume;
  }, [isMuted, volume]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.error("Playback failed:", err);
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    setIsMuted((prev) => {
      const next = !prev;
      if (audio && !next && audio.paused) {
        void audio.play();
      }
      return next;
    });
  };

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    setVolume(next);
    if (next > 0 && isMuted) {
      setIsMuted(false);
    }
    if (next === 0 && !isMuted) {
      setIsMuted(true);
    }
  };

  useEffect(() => {
    if (!dailyBottle) {
      setDailyOpen(false);
    }
  }, [dailyBottle]);

  return (
    <>
      <section className={styles.landscape}>
        {!isLoadingBottle && (
          <>
            <audio
              ref={audioRef}
              src="/sounds/forest-audio.mp3"
              loop
              playsInline
            />
            <div
              className={styles.audioControls}
              role="group"
              aria-label="Note Lake soundscape controls">
              <button
                type="button"
                className={styles.audioButton}
                onClick={togglePlayback}
                aria-label={
                  isPlaying ? "Pause ambient audio" : "Play ambient audio"
                }>
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button
                type="button"
                className={styles.audioButton}
                onClick={toggleMute}
                aria-label={
                  isMuted ? "Unmute ambient audio" : "Mute ambient audio"
                }>
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <label className={styles.audioSliderLabel}>
                <span className={styles.audioSliderText}>Vol</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className={styles.audioSlider}
                  aria-label="Volume"
                />
              </label>
            </div>
          </>
        )}

        {!isLoadingBottle &&
          (isSignedIn ? (
            <>
              <NoteLakeCreateModal refetchBottle={refetchBottle} />
              {!dailyBottle && (
                <div className="absolute z-20 bottom-0 inset-x-0 p-4 rounded bg-white/30 flex justify-center items-center gap-2">
                  <ArrowUp size={14} />
                  <p className="text-center">
                    No notes yet — start adding to discover them washed ashore.
                  </p>
                  <ArrowUp size={14} />
                </div>
              )}
            </>
          ) : (
            <div className="absolute z-20 bottom-0 inset-x-0 p-4 rounded bg-white/30">
              <p className="text-center">
                Sign in to add messages to your lake
              </p>
            </div>
          ))}

        {isLoadingBottle && (
          <div className="fixed inset-0 bg-black/50 z-20">
            <div className="h-full flex flex-col justify-center items-center">
              <div className="size-20 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        )}

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
        {dailyBottle ? (
          <>
            <button
              type="button"
              onClick={() => {
                setDailyOpen(true);
              }}
              className={`${styles.washedBottle} ${styles.washedBottleGlow}`}
              aria-label="Open the washed-up bottle"
              disabled={isLoadingBottle}>
              <div className={styles.bottleGlass}>
                <div className={styles.bottleHighlight} />
                <div className={styles.bottleShadow} />
              </div>
              <div className={styles.bottleCork} />
              <div className={styles.bottleScroll} />
            </button>
            {/* bottle dirt mask */}
            <div className={styles["dirt-mask"]}></div>
          </>
        ) : null}
      </section>

      {/* bottle message modal */}
      {dailyBottle && dailyOpen && (
        <MessageModal>
          <h3 className="relative text-lg font-semibold text-slate-900">
            {dailyBottle.title}
          </h3>
          <p className="relative mt-3 whitespace-pre-line text-pretty text-slate-700">
            {dailyBottle.message}
          </p>
          <p className="relative mt-4 text-xs uppercase tracking-wider text-slate-400">
            Bottled {dailyBottle.createdAt}
          </p>
          {BottleError ? (
            <p className="relative mt-4 text-sm text-red-500">{BottleError}</p>
          ) : null}
          <div className="relative mt-6 flex justify-end gap-3">
            <button
              type="button"
              className="relative button button-border"
              onClick={() => setDailyOpen(false)}>
              Close
            </button>
            {isSignedIn && (
              <button
                type="button"
                className="relative button button-filled"
                onClick={deleteBottle}
                disabled={isDeletingBottle}>
                {isDeletingBottle ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
        </MessageModal>
      )}
    </>
  );
}
