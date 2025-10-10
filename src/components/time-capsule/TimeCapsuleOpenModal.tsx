"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import MessageModal from "../MessageModal";

type LoaderResult = {
  message: string;
  openedAt?: string | null;
  openOn?: string;
};

type TimeCapsuleOpenModalProps = {
  capsuleId: string;
  title: string;
  openOn: string;
  message?: string | null;
  loader?: () => Promise<LoaderResult>;
  canOpenOverride?: boolean;
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
  message: initialMessage,
  loader,
  canOpenOverride,
  trigger,
}: TimeCapsuleOpenModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [displayOpenOn, setDisplayOpenOn] = useState<string>(openOn);

  const defaultLoader = useCallback(async () => {
    const response = await fetch(`/api/time-capsules?id=${capsuleId}`, {
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

    router.refresh();

    return {
      message: payload.capsule.message,
      openedAt: payload.capsule.openedAt ?? payload.capsule.openOn,
      openOn: payload.capsule.openOn,
    };
  }, [capsuleId, router]);

  const isUnlocked = useMemo(() => {
    if (typeof canOpenOverride === "boolean") {
      return canOpenOverride;
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
      0
    );

    return todayMidnight >= openDate;
  }, [canOpenOverride, openOn]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    async function loadCapsule() {
      setIsLoading(true);
      setError(null);

      try {
        if (initialMessage && !loader) {
          setMessage(initialMessage);
          setDisplayOpenOn(openOn);
          return;
        }

        const loaderFn = loader ?? defaultLoader;
        const result = await loaderFn();

        setMessage(result.message);
        if (result.openOn) {
          setDisplayOpenOn(result.openOn);
        }
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "We could not open this time capsule. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (isUnlocked) {
      void loadCapsule();
    } else {
      setError("This time capsule is still locked.");
      setIsLoading(false);
    }
  }, [defaultLoader, initialMessage, isOpen, isUnlocked, loader, openOn]);

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
        <MessageModal>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Opens on {formatDate(displayOpenOn) ?? "Unknown date"}
          </p>

          <div className="mt-6 space-y-4 text-sm text-neutral-700">
            {isLoading ? (
              <p>Opening your capsule…</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : message ? (
              <>
                <p className="whitespace-pre-wrap leading-relaxed">{message}</p>
              </>
            ) : (
              <p className="text-neutral-600">No message to display yet.</p>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="button button-border">
              Close
            </button>
          </div>
        </MessageModal>
      ) : null}
    </>
  );
}
