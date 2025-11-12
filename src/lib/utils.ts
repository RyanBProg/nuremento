import {
  format,
  startOfDay,
  differenceInCalendarDays,
  isBefore,
  isValid,
  parseISO,
} from "date-fns";
import { MAX_TIMECAPSULE_FUTURE_DAYS } from "@/lib/constants";

export function formatDate(value: string | Date | null): string {
  if (!value) {
    return "—";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.toString();
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function getTodaysDate() {
  return format(startOfDay(new Date()), "yyyy-MM-dd");
}

export function parseAndValidateOpenDate(raw: unknown) {
  if (typeof raw !== "string") {
    return { error: "openOn must be an ISO date string." };
  }

  const openDate = parseISO(raw);

  if (!isValid(openDate)) {
    return { error: "openOn is not a valid date." };
  }

  const now = new Date();
  const earliestAllowed = startOfDay(now);

  if (isBefore(openDate, earliestAllowed)) {
    return { error: "openOn must be today or later." };
  }

  if (differenceInCalendarDays(openDate, now) > MAX_TIMECAPSULE_FUTURE_DAYS) {
    return { error: "openOn cannot be more than six months away." };
  }

  return { date: openDate };
}
