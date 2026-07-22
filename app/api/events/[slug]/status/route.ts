import { NextRequest } from "next/server";

import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import { eventStatusUpdateSchema } from "@/lib/validations/event";
import { apiSuccess, apiError } from "@/lib/api-response";

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

    const updatedEvent = await Event.findOneAndUpdate(
      { slug: normalizedSlug },
      { status: result.data.status },
      { new: true }
    );

    if (!updatedEvent) {
      return apiError("Event not found!", 404);
    }

    return apiSuccess("Status updated successfully", { event: updatedEvent });
  } catch (error) {
    console.error("Status update failed:", error);
    return apiError("Status update failed", 500);
  }
}
