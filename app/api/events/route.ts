import { NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";

import connectDB from "@/lib/mongodb";
import Event, { generateSlug } from "@/database/event.model";
import { eventBaseSchema, eventCreateSchema } from "@/lib/validations/event";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getCloudinaryEnv } from "@/lib/env";
import { checkRateLimit, getClientIpFromRequest } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const CREATE_EVENT_RATE_LIMIT = 5;
const CREATE_EVENT_RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

function uploadImage(buffer: Buffer): Promise<{ secure_url: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { resource_type: "image", folder: "DevEvent" },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result as { secure_url: string });
        }
      )
      .end(buffer);
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return apiError("You must be signed in to create an event.", 401);
    }

    if (session.user.role !== "organizer" && session.user.role !== "admin") {
      return apiError("Only organizers can create events.", 403);
    }

    const ip = getClientIpFromRequest(req);
    const { allowed } = checkRateLimit(
      `create-event:${ip}`,
      CREATE_EVENT_RATE_LIMIT,
      CREATE_EVENT_RATE_WINDOW_MS
    );

    if (!allowed) {
      return apiError(
        "Too many events created recently. Please try again later.",
        429
      );
    }

    await connectDB();

    const formData = await req.formData();
    const raw = Object.fromEntries(formData.entries());

    const file = formData.get("image");
    const tagsRaw = formData.get("tags");
    const agendaRaw = formData.get("agenda");

    if (!(file instanceof File) || file.size === 0) {
      return apiError("Image file is required", 400);
    }

    if (!file.type.startsWith("image/")) {
      return apiError("Image must be an image file", 400);
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return apiError("Image file is too large (max 5MB)", 400);
    }

    if (typeof tagsRaw !== "string" || typeof agendaRaw !== "string") {
      return apiError("Tags and agenda are required", 400);
    }

    let tags: unknown;
    let agenda: unknown;
    try {
      tags = JSON.parse(tagsRaw);
      agenda = JSON.parse(agendaRaw);
    } catch {
      return apiError("Invalid tags or agenda format", 400);
    }

    // Validate every text field (title, description, dates, tags, agenda, etc.)
    // BEFORE touching Cloudinary, so a bad request never burns an upload.
    const fieldsResult = eventBaseSchema.safeParse({
      ...raw,
      tags,
      agenda,
      capacity: Number(raw.capacity),
    });

    if (!fieldsResult.success) {
      return apiError("Invalid event data", 400, {
        errors: z.treeifyError(fieldsResult.error),
      });
    }

    const slug = generateSlug(fieldsResult.data.title);
    const existingEvent = await Event.findOne({ slug });

    if (existingEvent) {
      return apiError(
        "An event with a similar title already exists. Please use a different title.",
        409
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    getCloudinaryEnv();
    const uploadResult = await uploadImage(buffer);

    // Full server payload, now including the real Cloudinary URL.
    const createResult = eventCreateSchema.safeParse({
      ...fieldsResult.data,
      image: uploadResult.secure_url,
    });

    if (!createResult.success) {
      return apiError("Invalid event data", 400, {
        errors: z.treeifyError(createResult.error),
      });
    }

    const createdEvent = await Event.create({
      ...createResult.data,
      createdBy: session.user.id,
    });

    return apiSuccess("Event created successfully", { event: createdEvent }, 201);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return apiError(
        "An event with a similar title already exists. Please use a different title.",
        409
      );
    }

    console.error("Event creation failed:", error);
    return apiError("Event creation failed", 500);
  }
}

export async function GET() {
  try {
    await connectDB();

    const events = await Event.find({ status: "published" }).sort({
      createdAt: -1,
    });

    return apiSuccess("Events fetched successfully", { events });
  } catch (error) {
    console.error("Event fetching failed:", error);
    return apiError("Event fetching failed", 500);
  }
}
