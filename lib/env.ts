import { z } from "zod";

/**
 * Client-safe env vars. All optional/defaulted - resolved eagerly since
 * none of these should ever hard-crash the app. Each NEXT_PUBLIC_* var is
 * referenced literally (process.env.NEXT_PUBLIC_X) so Next.js's build-time
 * inlining still works correctly for client components.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z
    .string()
    .url()
    .default("https://us.i.posthog.com"),
});

export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
});

/**
 * Server-only secrets. Required for real functionality (DB, image uploads),
 * but validated LAZILY via the getters below - never at module import time.
 * An eager top-level throw here would crash any build/request that merely
 * imports this file before .env is loaded, which is exactly the bug that
 * was fixed in lib/mongodb.ts earlier in this project. Each getter is also
 * scoped to only what that specific feature needs - connectToDatabase()
 * only needs MONGODB_URI, so it shouldn't fail on a missing Cloudinary key.
 */
const databaseEnvSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
});

const cloudinaryEnvSchema = z.object({
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
});

function parseEnvOrThrow<T extends z.ZodTypeAny>(
  schema: T,
  values: Record<string, string | undefined>
): z.infer<T> {
  const result = schema.safeParse(values);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `Invalid or missing environment variables:\n${issues}\n\nCheck your .env.local against .env.example.`
    );
  }

  return result.data;
}

let cachedDatabaseEnv: z.infer<typeof databaseEnvSchema> | null = null;
let cachedCloudinaryEnv: z.infer<typeof cloudinaryEnvSchema> | null = null;

/** Validates just MONGODB_URI - used by connectToDatabase(). */
export function getDatabaseEnv() {
  if (!cachedDatabaseEnv) {
    cachedDatabaseEnv = parseEnvOrThrow(databaseEnvSchema, {
      MONGODB_URI: process.env.MONGODB_URI,
    });
  }
  return cachedDatabaseEnv;
}

/** Validates the three Cloudinary vars - used before any upload/destroy call. */
export function getCloudinaryEnv() {
  if (!cachedCloudinaryEnv) {
    cachedCloudinaryEnv = parseEnvOrThrow(cloudinaryEnvSchema, {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    });
  }
  return cachedCloudinaryEnv;
}
