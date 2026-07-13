import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
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
      return NextResponse.json(
        {
          message: "Slug is required.",
        },
        {
          status: 400,
        }
      );
    }

    const normalizedSlug = slug.trim().toLowerCase();

    // Find event by slug
    const event = await Event.findOne({
      slug: normalizedSlug,
    }).lean();

    if (!event) {
      return NextResponse.json(
        {
          message: "Event not found!",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        message: "Event fetched successfully.",
        event,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Failed to fetch event:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch event.",
      },
      {
        status: 500,
      }
    );
  }
}