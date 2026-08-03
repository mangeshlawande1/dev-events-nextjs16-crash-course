import { NextRequest } from "next/server";

import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import { eventStatusUpdateSchema } from "@/lib/validations/event";
import { apiSuccess, apiError } from "@/lib/api-response";
import { auth } from "@/lib/auth";
import { canManageEvent } from "@/lib/ownership";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const { slug } = await params;
    const normalizedSlug = slug?.trim().toLowerCase();

    if (!normalizedSlug) {
      return apiError("Slug is required.", 400);
    }

    const body = await req.json();
    const result = eventStatusUpdateSchema.safeParse(body);

    if (!result.success) {
      return apiError("Invalid status. Must be 'draft' or 'published'.", 400);
    }

    const existingEvent = await Event.findOne({ slug: normalizedSlug });

    if (!existingEvent) {
      return apiError("Event not found!", 404);
    }

    const session = await auth();
    if (!canManageEvent(existingEvent.createdBy, session)) {
      return apiError(
        "You don't have permission to update this event's status.",
        403
      );
    }

    existingEvent.status = result.data.status;
    await existingEvent.save();

    return apiSuccess("Status updated successfully", { event: existingEvent });
  } catch (error) {
    console.error("Status update failed:", error);
    return apiError("Status update failed", 500);
  }
}
