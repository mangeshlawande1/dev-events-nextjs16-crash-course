import { z } from "zod";

/**
 * Shared enum for the event mode.
 */
export const eventMode = z.enum([
  "online",
  "offline",
  "hybrid",
]);

/**
 * Validation schema for the Create Event form.
 */
export const eventSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters.")
    .max(100, "Title cannot exceed 100 characters."),

  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters."),

  overview: z
    .string()
    .trim()
    .min(20, "Overview must be at least 20 characters."),

  venue: z
    .string()
    .trim()
    .min(3, "Venue is required."),

  location: z
    .string()
    .trim()
    .min(3, "Location is required."),

  date: z
    .string()
    .min(1, "Please select a date."),

  time: z
    .string()
    .min(1, "Please select a time."),

  mode: eventMode,

  audience: z
    .string()
    .trim()
    .min(3, "Audience is required."),

  organizer: z
    .string()
    .trim()
    .min(3, "Organizer is required."),

  agenda: z
    .array(
      z.string().trim().min(1)
    )
    .min(1, "Add at least one agenda item."),

  tags: z
    .array(
      z.string().trim().min(1)
    )
    .min(1, "Add at least one tag."),

  image: z
    .instanceof(File, {
      message: "Please select an image.",
    })
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "Image size must be less than 5 MB."
    )
    .refine(
      (file) => file.type.startsWith("image/"),
      "Only image files are allowed."
    ),
});

/**
 * Type inferred directly from the schema.
 * Keeps the form type synchronized with validation.
 */
export type EventFormSchema = z.infer<typeof eventSchema>;