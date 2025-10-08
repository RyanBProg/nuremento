import z from "zod";

const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 300;
const MAX_LOCATION_LENGTH = 25;
const MAX_MOOD_LENGTH = 25;

function normalizeOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

const requiredTrimmedString = (max: number, field: string) =>
  z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z
      .string({ required_error: `${field} is required` })
      .min(1, `${field} is required`)
      .max(max, `${field} must be ${max} characters or less.`)
  );

const optionalLimitedString = (max: number, field: string) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => normalizeOptionalString(value))
    .superRefine((value, ctx) => {
      if (value && value.length > max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${field} must be ${max} characters or less.`,
        });
      }
    })
    .transform((value) => value ?? null);

const requiredDateString = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : value),
  z
    .string({ required_error: "Occurred on date is required" })
    .min(1, "Occurred on date is required")
    .superRefine((value, ctx) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Occurred on date must be YYYY-MM-DD.",
        });
        return;
      }

      const parsed = new Date(value);

      if (Number.isNaN(parsed.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Occurred on date must be a valid date.",
        });
      }
    })
);

const optionalDateString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => normalizeOptionalString(value))
  .superRefine((value, ctx) => {
    if (!value) {
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Occurred on date must be YYYY-MM-DD.",
      });
      return;
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Occurred on date must be a valid date.",
      });
    }
  })
  .transform((value) => value ?? null);

export const metadataSchema = z.object({
  title: requiredTrimmedString(MAX_TITLE_LENGTH, "Title"),
  description: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z
      .string({ required_error: `Description is required` })
      .min(20, `Please write a longer description, minimum 20 characters`)
      .max(
        MAX_DESCRIPTION_LENGTH,
        `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less.`
      )
  ),
  occurredOn: optionalDateString,
  location: optionalLimitedString(MAX_LOCATION_LENGTH, "Location"),
  mood: optionalLimitedString(MAX_MOOD_LENGTH, "Mood"),
});

export const aiDescriptionInput = z.object({
  title: requiredTrimmedString(MAX_TITLE_LENGTH, "Title"),
  description: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z
      .string({ required_error: `Description is required` })
      .min(20, `Please write a longer description, minimum 20 characters`)
      .max(
        MAX_DESCRIPTION_LENGTH,
        `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less.`
      )
  ),
});

export const timeCapsuleData = z.object({
  title: requiredTrimmedString(MAX_TITLE_LENGTH, "Title"),
  message: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z
      .string({ required_error: `Description is required` })
      .min(20, `Please write a longer description, minimum 20 characters`)
      .max(
        MAX_DESCRIPTION_LENGTH,
        `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less.`
      )
  ),
  openOn: requiredDateString,
});
