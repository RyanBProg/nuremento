import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";

type LakeNote = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
};

type LakeNoteResponse = {
  note: LakeNote | null;
};

const defaultNote: LakeNote = {
  id: "demo",
  title: "Tide-carried note",
  message:
    "Add notes to your lake and enjoy opening wonderful messages from your past self.",
  createdAt: new Date().toISOString().slice(0, 10),
};

export function useDailyBottle() {
  const { isLoaded, isSignedIn } = useAuth();

  const [dailyBottle, setDailyBottle] = useState<LakeNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBottle = useCallback(async () => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setDailyBottle(defaultNote);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/lake-notes");
      if (!response.ok) throw new Error("Failed to fetch lake note");

      const payload = (await response.json()) as LakeNoteResponse;

      setDailyBottle(
        payload.note
          ? {
              id: payload.note.id,
              title: payload.note.title,
              message: payload.note.message,
              createdAt:
                payload.note.createdAt ?? new Date().toISOString().slice(0, 10),
            }
          : null
      );
    } catch (err) {
      console.error("Error fetching lake note", err);
      setError("Could not load note");
      setDailyBottle(null);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  const deleteBottle = useCallback(async () => {
    if (!dailyBottle || !isSignedIn) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/lake-notes?id=${dailyBottle.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete lake note");

      setDailyBottle(null);
    } catch (err) {
      console.error("Error deleting lake note", err);
      setError("We could not delete this note. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }, [dailyBottle, isSignedIn]);

  useEffect(() => {
    fetchBottle();
  }, [fetchBottle]);

  return {
    dailyBottle,
    isLoading,
    isDeleting,
    error,
    refetch: fetchBottle,
    deleteBottle,
  };
}
