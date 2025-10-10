"use client";

import { Pause, Play, Plus, Volume2, VolumeX } from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import styles from "./LakeScene.module.css";
import MessageModal from "@/components/MessageModal";
import { SignedIn, SignedOut } from "@clerk/nextjs";

type OceanMemory = {
  id: string;
  text: string;
  createdAt: string;
};

const randomFrom = <T,>(items: T[]): T | null => {
  if (!items.length) {
    return null;
  }

  const index = Math.floor(Math.random() * items.length);
  return items[index];
};

const createMemory = (text: string): OceanMemory => ({
  id: `memory-${
    globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 10)
  }`,
  text,
  createdAt: new Date().toISOString(),
});

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.5);

  const seeds = useMemo<OceanMemory[]>(
    () => [
      createMemory(
        "Today I promised to write more letters. The tide felt warm on my feet as I said it out loud."
      ),
      createMemory(
        "Grandma's stories about the moon guiding sailors still make me feel safe. I hope I remember them forever."
      ),
      createMemory(
        "I laughed until I cried over pancakes this morning. May future-me taste that joy again."
      ),
    ],
    []
  );

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

  const [dailyBottle, setDailyBottle] = useState<OceanMemory | null>(() =>
    randomFrom(seeds)
  );
  const [dailyOpen, setDailyOpen] = useState(false);

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

  return (
    <>
      <section className={styles.landscape}>
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
          aria-label="Memory Lake soundscape controls">
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

        <SignedIn>
          <button className="z-20 absolute top-24 right-5 button-lg button-filled flex items-center gap-3">
            <Plus /> New message
          </button>
        </SignedIn>

        <SignedOut>
          <p className="p-4 rounded bg-white/40">
            <div>Sign in to add meesages to your lake</div>
          </p>
        </SignedOut>

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
          onClick={() => setDailyOpen(true)}
          className={`${styles.washedBottle} ${styles.washedBottleGlow}`}
          aria-label="Open the washed-up bottle">
          <div className={styles.bottleGlass}>
            <div className={styles.bottleHighlight} />
            <div className={styles.bottleShadow} />
          </div>
          <div className={styles.bottleCork} />
          <div className={styles.bottleScroll} />
        </button>
        {/* bottle dirk mask */}
        <div className={styles["dirt-mask"]}></div>
      </section>
      {/* bottle message modal */}
      {dailyBottle && dailyOpen && (
        <MessageModal>
          <h3 className="relative text-lg font-semibold text-slate-900">
            Tide-carried memory
          </h3>
          <p className="relative mt-3 whitespace-pre-line text-pretty text-slate-700">
            {dailyBottle.text}
          </p>
          <p className="relative mt-4 text-xs uppercase tracking-wider text-slate-400">
            Bottled 04/04/2025
          </p>
          <div className="relative mt-6 flex justify-end">
            <button
              type="button"
              className="relative button button-border"
              onClick={() => setDailyOpen(false)}>
              Delete
            </button>
          </div>
        </MessageModal>
      )}
    </>
  );
}
