"use client";

import { ArrowUp, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import styles from "./LakeScene.module.css";
import MessageModal from "@/components/MessageModal";
import { useAuth } from "@clerk/nextjs";
import { NoteLakeCreateModal } from "@/components/memory-lake/NoteLakeCreateModal";

type LakeNoteResponse = {
  note: {
    id: string;
    title: string;
    message: string;
    createdAt?: string | null;
  } | null;
};

type LakeNote = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
};

const defaultNote = {
  id: "123",
  title: "Tide-carried note",
  message:
    "Add notes to your lake and enjoy opening wonderful messages from your past self.",
  createdAt: new Date().toISOString().slice(0, 10),
};

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [dailyBottle, setDailyBottle] = useState<LakeNote | null>(null);
  const [dailyOpen, setDailyOpen] = useState(false);
  const [isLoadingBottle, setIsLoadingBottle] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      setDailyBottle(defaultNote);
      setIsLoadingBottle(false);
      setDeleteError(null);
      return;
    }

    setDailyBottle(null);
    let cancelled = false;

    async function loadDailyBottle() {
      setIsLoadingBottle(true);
      setDeleteError(null);

      try {
        const response = await fetch("/api/lake-notes", { method: "GET" });

        if (!response.ok) {
          console.error("Failed to fetch lake note", response.status);
          if (!cancelled) {
            setDailyBottle(null);
          }
          return;
        }

        const payload = (await response.json()) as LakeNoteResponse;

        if (cancelled) {
          return;
        }

        if (payload.note) {
          setDailyBottle({
            id: payload.note.id,
            title: payload.note.title,
            message: payload.note.message,
            createdAt:
              payload.note.createdAt ?? new Date().toISOString().slice(0, 10),
          });
        } else {
          setDailyBottle(null);
        }
      } catch (error) {
        console.error("Error fetching lake note", error);
        if (!cancelled) {
          setDailyBottle(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingBottle(false);
        }
      }
    }

    loadDailyBottle();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    setIsPlaying(!audio.paused);
    setIsMuted(audio.muted);
    setVolume(audio.volume);

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    audio.volume = volume;
    audio.muted = isMuted;

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.muted = isMuted;
    if (isMuted && !audio.paused) {
      setIsPlaying(true);
    }
  }, [isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.volume = volume;
  }, [volume]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
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

  const handleDelete = async () => {
    if (!dailyBottle) {
      return;
    }

    if (!isSignedIn) {
      setDailyOpen(false);
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/lake-notes?id=${dailyBottle.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: unknown;
        } | null;
        const message =
          typeof payload?.error === "string"
            ? payload.error
            : "We could not delete this note. Please try again.";
        setDeleteError(message);
        return;
      }

      setDailyBottle(null);
      setDailyOpen(false);
    } catch (error) {
      console.error("Error deleting lake note", error);
      setDeleteError("We could not delete this note. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <section className={styles.landscape}>
        {!isLoadingBottle && (
          <>
            <audio
              ref={audioRef}
              src="/sounds/forest-audio.mp3"
              autoPlay
              loop
              muted
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
              <NoteLakeCreateModal />
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
            <div className="absolute z-20 top-0 inset-x-0 p-4 rounded bg-white/30">
              <p className="text-center">
                Sign in to add messages to your lake
              </p>
            </div>
          ))}

        {isLoadingBottle && (
          <div className="fixed inset-0 bg-black/50 z-20">
            <div className="h-full flex flex-col justify-center items-center">
              <div
                className={`size-20 border-3 border-kinori-teal border-t-transparent rounded-full animate-spin`}
              />
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
                setDeleteError(null);
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
            <div className={styles["dirt-mask"]}></div>
          </>
        ) : null}
        {/* bottle dirk mask */}
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
          {deleteError ? (
            <p className="relative mt-4 text-sm text-red-500">{deleteError}</p>
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
                onClick={handleDelete}
                disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
        </MessageModal>
      )}
    </>
  );
}
