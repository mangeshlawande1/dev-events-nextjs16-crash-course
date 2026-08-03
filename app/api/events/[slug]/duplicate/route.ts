import { NextRequest } from "next/server";

import connectDB from "@/lib/mongodb";
import Event, { generateSlug } from "@/database/event.model";
import type { EventResponse } from "@/database/event.model";
import { apiSuccess, apiError } from "@/lib/api-response";
import { auth } from "@/lib/auth";
import { canManageEvent } from "@/lib/ownership";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Builds a unique "{title} (Copy)" / slug pair, appending a numeric
 * suffix (2, 3, ...) if that title has already been used before.
 */
async function buildUniqueCopyTitleAndSlug(
  originalTitle: string
): Promise<{ title: string; slug: string }> {
  let suffix = 1;

  while (true) {
    const candidateTitle =
      suffix === 1 ? `${originalTitle} (Copy)` : `${originalTitle} (Copy ${suffix})`;
    const candidateSlug = generateSlug(candidateTitle);

    const exists = await Event.findOne({ slug: candidateSlug });
    if (!exists) {
      return { title: candidateTitle, slug: candidateSlug };
    }

    suffix += 1;
  }
}

export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const { slug } = await params;
    const normalizedSlug = slug?.trim().toLowerCase();

    if (!normalizedSlug) {
      return apiError("Slug is required.", 400);
    }

    const sourceEvent = (await Event.findOne({
      slug: normalizedSlug,
    }).lean()) as EventResponse | null;

    if (!sourceEvent) {
      return apiError("Event not found!", 404);
    }

    const session = await auth();
    if (!canManageEvent(sourceEvent.createdBy, session)) {
      return apiError("You don't have permission to duplicate this event.", 403);
    }

    const { title, slug: newSlug } = await buildUniqueCopyTitleAndSlug(
      sourceEvent.title
    );

    const duplicatedEvent = await Event.create({
      title,
      slug: newSlug,
      status: "draft",
      description: sourceEvent.description,
      overview: sourceEvent.overview,
      image: sourceEvent.image,
      venue: sourceEvent.venue,
      location: sourceEvent.location,
      date: sourceEvent.date,
      time: sourceEvent.time,
      mode: sourceEvent.mode,
      audience: sourceEvent.audience,
      capacity: sourceEvent.capacity,
      agenda: sourceEvent.agenda,
      organizer: sourceEvent.organizer,
      tags: sourceEvent.tags,
      createdBy: sourceEvent.createdBy,
    });

    return apiSuccess(
      "Event duplicated successfully",
      { event: duplicatedEvent },
      201
    );
  } catch (error) {
    console.error("Event duplication failed:", error);
    return apiError("Event duplication failed", 500);
  }
}
