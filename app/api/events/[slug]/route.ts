import { NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";

import connectDB from "@/lib/mongodb";
import Event, { generateSlug } from "@/database/event.model";
import Booking from "@/database/booking.model";
import { eventBaseSchema, eventUpdateSchema } from "@/lib/validations/event";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getCloudinaryEnv } from "@/lib/env";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

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

/** Extracts the Cloudinary public_id (e.g. "DevEvent/abc123") from a secure_url. */
function extractPublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  return match ? match[1] : null;
}

export async function GET(
  _req: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();

    const { slug } = await params;

    // Validate slug parameter
    if (!slug || typeof slug !== "string") {
      return apiError("Slug is required.", 400);
    }

    const normalizedSlug = slug.trim().toLowerCase();

    // Find event by slug (public endpoint - published only, same as the
    // public detail page; dashboard/edit use their own dedicated lookups
    // further down that intentionally include drafts).
    const event = await Event.findOne({
      slug: normalizedSlug,
      status: "published",
    }).lean();

    if (!event) {
      return apiError("Event not found!", 404);
    }

    return apiSuccess("Event fetched successfully.", { event });
  } catch (error) {
    console.error("Failed to fetch event:", error);
    return apiError("Failed to fetch event.", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const { slug } = await params;
    const normalizedSlug = slug?.trim().toLowerCase();

    if (!normalizedSlug) {
      return apiError("Slug is required.", 400);
    }

    const existingEvent = await Event.findOne({ slug: normalizedSlug });

    if (!existingEvent) {
      return apiError("Event not found!", 404);
    }

    const formData = await req.formData();
    const raw = Object.fromEntries(formData.entries());

    const file = formData.get("image");
    const tagsRaw = formData.get("tags");
    const agendaRaw = formData.get("agenda");

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

    // If the title changed, the slug is regenerated to match it - check
    // uniqueness against every OTHER event (excluding this one).
    const newSlug = generateSlug(fieldsResult.data.title);

    if (newSlug !== existingEvent.slug) {
      const slugTaken = await Event.findOne({
        slug: newSlug,
        _id: { $ne: existingEvent._id },
      });

      if (slugTaken) {
        return apiError(
          "An event with a similar title already exists. Please use a different title.",
          409
        );
      }
    }

    // Image is optional on edit - only touch Cloudinary if a new file was sent.
    let imageUrl = existingEvent.image;

    if (file instanceof File && file.size > 0) {
      if (!file.type.startsWith("image/")) {
        return apiError("Image must be an image file", 400);
      }

      if (file.size > MAX_IMAGE_SIZE) {
        return apiError("Image file is too large (max 5MB)", 400);
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      getCloudinaryEnv();
      const uploadResult = await uploadImage(buffer);
      imageUrl = uploadResult.secure_url;
    }

    const updateResult = eventUpdateSchema.safeParse({
      ...fieldsResult.data,
      image: imageUrl,
    });

    if (!updateResult.success) {
      return apiError("Invalid event data", 400, {
        errors: z.treeifyError(updateResult.error),
      });
    }

    existingEvent.set(updateResult.data);
    await existingEvent.save();

    return apiSuccess("Event updated successfully", { event: existingEvent });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return apiError(
        "An event with a similar title already exists. Please use a different title.",
        409
      );
    }

    console.error("Event update failed:", error);
    return apiError("Event update failed", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const { slug } = await params;
    const normalizedSlug = slug?.trim().toLowerCase();

    if (!normalizedSlug) {
      return apiError("Slug is required.", 400);
    }

    const existingEvent = await Event.findOne({ slug: normalizedSlug });

    if (!existingEvent) {
      return apiError("Event not found!", 404);
    }

    // Cascade: remove bookings tied to this event so none are left orphaned.
    await Booking.deleteMany({ eventId: existingEvent._id });

    // Best-effort Cloudinary cleanup - don't fail the whole delete if this errors.
    const publicId = extractPublicId(existingEvent.image);
    if (publicId) {
      try {
        getCloudinaryEnv();
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error("Cloudinary cleanup failed:", cloudinaryError);
      }
    }

    await Event.deleteOne({ _id: existingEvent._id });

    return apiSuccess("Event deleted successfully");
  } catch (error) {
    console.error("Event deletion failed:", error);
    return apiError("Event deletion failed", 500);
  }
}
