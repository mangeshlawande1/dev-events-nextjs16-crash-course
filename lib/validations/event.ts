import { z } from "zod";

/**
 * Shared enum for event mode.
 */
export const eventMode = z.enum([
  "online",
  "offline",
  "hybrid",
]);

/**
 * Shared enum for event status.
 */
export const eventStatus = z.enum(["draft", "published"]);

/**
 * Shared validation used by both client and server.
 */
export const eventBaseSchema = z.object({
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

  capacity: z
    .number()
    .int("Capacity must be a whole number.")
    .min(1, "Capacity must be at least 1."),

  organizer: z
    .string()
    .trim()
    .min(3, "Organizer is required."),

  agenda: z
    .array(z.string().trim().min(1))
    .min(1, "Add at least one agenda item."),

  tags: z
    .array(z.string().trim().min(1))
    .min(1, "Add at least one tag."),

  status: eventStatus,
});

/**
 * Client-side schema.
 * Image is uploaded as a File.
 */
export const eventFormSchema = eventBaseSchema.extend({
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
 * Server-side schema.
 * Image has already been uploaded to Cloudinary,
 * so it is validated as a URL string.
 */
export const eventCreateSchema = eventBaseSchema.extend({
  image: z
    .string()
    .trim()
    .url("Invalid image URL."),
});

/**
 * Client-side edit schema.
 * Image is optional - if the user doesn't pick a new file,
 * the existing Cloudinary image is kept.
 */
export const eventEditFormSchema = eventBaseSchema.extend({
  image: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "Image size must be less than 5 MB."
    )
    .refine(
      (file) => file.type.startsWith("image/"),
      "Only image files are allowed."
    )
    .optional(),
});

/**
 * Server-side edit schema.
 * Image URL is optional for the same reason as above.
 */
export const eventUpdateSchema = eventBaseSchema.extend({
  image: z.string().trim().url("Invalid image URL.").optional(),
});

/**
 * Payload for the dedicated status-toggle endpoint.
 */
export const eventStatusUpdateSchema = z.object({
  status: eventStatus,
});

/**
 * Client form values.
 */
export type EventFormValues = z.infer<typeof eventFormSchema>;

/**
 * Client edit form values (image optional).
 */
export type EventEditFormValues = z.infer<typeof eventEditFormSchema>;

/**
 * Server payload.
 */
export type EventCreateValues = z.infer<typeof eventCreateSchema>;

/**
 * Server update payload.
 */
export type EventUpdateValues = z.infer<typeof eventUpdateSchema>;