export const MOOD_OPTIONS = [
  "Amazed",
  "Amused",
  "Appreciative",
  "Awestruck",
  "Blessed",
  "Bold",
  "Brave",
  "Calm",
  "Celebratory",
  "Centered",
  "Cheerful",
  "Confident",
  "Connected",
  "Content",
  "Courageous",
  "Curious",
  "Delighted",
  "Determined",
  "Empowered",
  "Energised",
  "Engaged",
  "Euphoric",
  "Excited",
  "Fulfilled",
  "Gentle",
  "Grateful",
  "Grounded",
  "Happy",
  "Hopeful",
  "Inspired",
  "Joyful",
  "Lively",
  "Loving",
  "Motivated",
  "Nostalgic",
  "Optimistic",
  "Peaceful",
  "Playful",
  "Proud",
  "Radiant",
  "Refreshed",
  "Reflective",
  "Relaxed",
  "Relieved",
  "Renewed",
  "Rested",
  "Satisfied",
  "Sentimental",
  "Serene",
  "Supportive",
  "Tender",
  "Thankful",
  "Thrilled",
  "Trusting",
  "Upbeat",
  "Warm",
  "Wide-eyed",
  "Wistful",
  "Wonder-filled",
  "Zealous",
] as const;

export type MoodOption = (typeof MOOD_OPTIONS)[number];

export function isMoodOption(value: unknown): value is MoodOption {
  if (typeof value !== "string") {
    return false;
  }

  return (MOOD_OPTIONS as ReadonlyArray<string>).includes(
    value as MoodOption
  );
}
