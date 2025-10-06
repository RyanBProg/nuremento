import z from "zod";

export const metadataSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  occurredOn: z
    .string()
    .optional()
    .nullable()
    .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), {
      message: "occurredOn must be YYYY-MM-DD",
    }),
  location: z.string().optional().nullable(),
  mood: z.string().optional().nullable(),
});
