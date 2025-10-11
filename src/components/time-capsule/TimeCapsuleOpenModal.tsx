"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MessageModal from "../MessageModal";
import LoadingSpinner from "../LoadingSpinner";
import { TimeCapsuleSummary } from "./TimeCapsulesPanel";

type TimeCapsuleOpenModalProps = {
  capsule: TimeCapsuleSummary;
  mode: "preview" | "live";
  isUnlockedOverride?: boolean;
};

type CapsuleResponse =
  | {
      capsule: {
        id: string;
        title: string;
        message: string;
        openOn: string;
        openedAt: string | null;
      };
    }
  | {
      error: string;
      openOn?: string;
    };

function toDate(value: string | null) {
  if (!value) {
    return null;
  }
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

function formatDate(value: string | null) {
  const date = toDate(value);
  if (!value) {
    return null;
  }

  if (!date) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function hasReachedOpenDate(value: string | null | undefined) {
  if (!value) {
    return false;
  }

  const openDate = toDate(value);

  if (!openDate) {
    return false;
  }

  const today = new Date();
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    0,
    0,
    0,
    0
  );

  return todayMidnight >= openDate;
}

export function TimeCapsuleOpenModal({
  capsule,
  mode,
  isUnlockedOverride,
}: TimeCapsuleOpenModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayMessage, setDisplayMessage] = useState<string | null>(
    capsule.message || null
  );

  const isUnlocked =
    typeof isUnlockedOverride === "boolean"
      ? isUnlockedOverride
      : hasReachedOpenDate(capsule.openOn);

  useEffect(() => {
    setDisplayMessage(capsule.message || null);
    setError(null);
    setIsLoading(false);
  }, [capsule.id, capsule.message]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!isUnlocked) {
      setIsLoading(false);
      setError("This time capsule is still locked.");
      return;
    }

    if (mode === "preview") {
      setIsLoading(false);
      return;
    }

    if (displayMessage) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadCapsule() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/time-capsules?id=${capsule.id}`, {
          method: "GET",
        });

        const payload = (await response.json()) as CapsuleResponse;

        if (!response.ok || !("capsule" in payload)) {
          const messageText =
            "error" in payload
              ? payload.error
              : "We could not open this time capsule. Please try again.";
          throw new Error(messageText);
        }

        if (!cancelled) {
          setDisplayMessage(payload.capsule.message);
          setIsLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "We could not open this time capsule. Please try again."
          );
          setIsLoading(false);
        }
      }
    }

    loadCapsule();

    return () => {
      cancelled = true;
    };
  }, [capsule.id, displayMessage, isOpen, isUnlocked, mode]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/time-capsules?id=${capsule.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: unknown;
        } | null;
        const message =
          typeof payload?.error === "string"
            ? payload.error
            : "We could not delete this time capsule. Please try again.";
        setError(message);
        return;
      }

      router.refresh();
      setIsOpen(false);
      setDisplayMessage(null);
    } catch (deleteError) {
      console.error(deleteError);
      setError("We could not delete this time capsule. Please try again.");
    } finally {
      setIsDeleting(false);
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setIsOpen(true);
        }}
        disabled={!isUnlocked}
        className="button button-border">
        {isLoading ? <LoadingSpinner size="5" /> : "Open"}
      </button>

      {isOpen && !isLoading ? (
        <MessageModal>
          <h2 className="text-xl font-semibold">{capsule.title}</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Opens on {formatDate(capsule.openOn) ?? "Unknown date"}
          </p>

          <div className="mt-6 space-y-4 text-sm text-neutral-700">
            {error ? (
              <p className="text-red-500">{error}</p>
            ) : displayMessage ? (
              <>
                <p className="whitespace-pre-wrap leading-relaxed">
                  {displayMessage}
                </p>
              </>
            ) : (
              <p className="text-neutral-600">No message to display yet.</p>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            {typeof isUnlockedOverride === "boolean" ? (
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="button button-border">
                Close
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="button button-border">
                {isDeleting ? <LoadingSpinner size="4" /> : "Delete"}
              </button>
            )}
          </div>
        </MessageModal>
      ) : null}
    </>
  );
}
