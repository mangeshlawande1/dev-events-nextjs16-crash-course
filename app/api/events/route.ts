import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";

import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import { eventBaseSchema, eventCreateSchema } from "@/lib/validations/event";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

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
    await connectDB();

    const formData = await req.formData();
    const raw = Object.fromEntries(formData.entries());

    const file = formData.get("image");
    const tagsRaw = formData.get("tags");
    const agendaRaw = formData.get("agenda");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { message: "Image file is required" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { message: "Image must be an image file" },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { message: "Image file is too large (max 5MB)" },
        { status: 400 }
      );
    }

    if (typeof tagsRaw !== "string" || typeof agendaRaw !== "string") {
      return NextResponse.json(
        { message: "Tags and agenda are required" },
        { status: 400 }
      );
    }

    let tags: unknown;
    let agenda: unknown;
    try {
      tags = JSON.parse(tagsRaw);
      agenda = JSON.parse(agendaRaw);
    } catch {
      return NextResponse.json(
        { message: "Invalid tags or agenda format" },
        { status: 400 }
      );
    }

    // Validate every text field (title, description, dates, tags, agenda, etc.)
    // BEFORE touching Cloudinary, so a bad request never burns an upload.
    const fieldsResult = eventBaseSchema.safeParse({
      ...raw,
      tags,
      agenda,
    });

    if (!fieldsResult.success) {
      return NextResponse.json(
        {
          message: "Invalid event data",
          errors: z.treeifyError(fieldsResult.error),
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadResult = await uploadImage(buffer);

    // Full server payload, now including the real Cloudinary URL.
    const createResult = eventCreateSchema.safeParse({
      ...fieldsResult.data,
      image: uploadResult.secure_url,
    });

    if (!createResult.success) {
      return NextResponse.json(
        {
          message: "Invalid event data",
          errors: z.treeifyError(createResult.error),
        },
        { status: 400 }
      );
    }

    const createdEvent = await Event.create(createResult.data);

    return NextResponse.json(
      { message: "Event created successfully", event: createdEvent },
      { status: 201 }
    );
  } catch (error) {
    console.error("Event creation failed:", error);
    return NextResponse.json(
      { message: "Event creation failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const events = await Event.find().sort({ createdAt: -1 });

    return NextResponse.json(
      { message: "Events fetched successfully", events },
      { status: 200 }
    );
  } catch (error) {
    console.error("Event fetching failed:", error);
    return NextResponse.json(
      { message: "Event fetching failed" },
      { status: 500 }
    );
  }
}
