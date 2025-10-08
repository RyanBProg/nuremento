"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type TimeCapsuleOpenModalProps = {
  capsuleId: string;
  title: string;
  openOn: string;
  openedAt: string | null;
  trigger: (props: { open: () => void; disabled?: boolean }) => ReactNode;
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

export function TimeCapsuleOpenModal({
  capsuleId,
  title,
  openOn,
  openedAt,
  trigger,
}: TimeCapsuleOpenModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [openedTimestamp, setOpenedTimestamp] = useState<string | null>(
    openedAt
  );

  const isUnlocked = useMemo(() => {
    if (openedTimestamp) {
      return true;
    }

    const today = new Date();
    const openDate = toDate(openOn);

    if (!openDate) {
      return false;
    }

    const todayMidnight = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0,
      0,
    );

    return todayMidnight >= openDate;
  }, [openOn, openedTimestamp]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    async function fetchCapsule() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/time-capsules?id=${capsuleId}`, {
          method: "GET",
        });

        const payload = (await response.json()) as CapsuleResponse;

        if (!response.ok || !("capsule" in payload)) {
          const messageText =
            "error" in payload
              ? payload.error
              : "We could not open this time capsule. Please try again.";
          setError(messageText);
          return;
        }

        setMessage(payload.capsule.message);
        setOpenedTimestamp(payload.capsule.openedAt ?? payload.capsule.openOn);
        router.refresh();
      } catch (err) {
        console.error(err);
        setError("We could not open this time capsule. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    if (isUnlocked) {
      void fetchCapsule();
    } else {
      setError("This time capsule is still locked.");
      setIsLoading(false);
    }
  }, [capsuleId, isOpen, isUnlocked, router]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setMessage(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return (
    <>
      {trigger({ open: handleOpen, disabled: !isUnlocked })}

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="relative max-h-full w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-4 top-4 text-sm text-neutral-600 transition hover:text-black"
              aria-label="Close">
              ✕
            </button>

            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Opens on {formatDate(openOn) ?? "Unknown date"}
            </p>

            <div className="mt-6 space-y-4 text-sm text-neutral-700">
              {isLoading ? (
                <p>Opening your capsule…</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : message ? (
                <>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {message}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Opened {formatDate(openedTimestamp) ?? "just now"}
                  </p>
                </>
              ) : (
                <p className="text-neutral-600">No message to display yet.</p>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full border px-4 py-2 text-sm font-medium transition">
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
