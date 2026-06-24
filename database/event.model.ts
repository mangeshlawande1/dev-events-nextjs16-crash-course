import {
  Schema,
  model,
  models,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

/**
 * Convert a title into a URL-friendly slug.
 */
function generateSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    overview: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    venue: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
    mode: {
      type: String,
      required: true,
      trim: true,
      enum: ["online", "offline", "hybrid"],
    },
    audience: {
      type: String,
      required: true,
      trim: true,
    },
    agenda: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: "Agenda cannot be empty.",
      },
    },
    organizer: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: "Tags cannot be empty.",
      },
    },
  },
  {
    timestamps: true,
  }
);

export type EventDocument = HydratedDocument<
  InferSchemaType<typeof eventSchema>
>;

/**
 * Generate slug only when title changes and normalize
 * date/time into a consistent format before saving.
 */
eventSchema.pre("save", async function () {
  const event = this as EventDocument;

  if (event.isModified("title")) {
    event.slug = generateSlug(event.title);
  }

  if (event.isModified("date")) {
    const parsedDate = new Date(event.date);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error("Invalid event date.");
    }

    event.date = parsedDate.toISOString();
  }

  if (event.isModified("time")) {
    const normalizedTime = event.time.trim().toUpperCase();
    event.time = normalizedTime;
  }

  const requiredFields = [
    event.title,
    event.description,
    event.overview,
    event.image,
    event.venue,
    event.location,
    event.date,
    event.time,
    event.mode,
    event.audience,
    event.organizer,
  ];

  const hasEmptyField = requiredFields.some(
    (field) => field.trim().length === 0
  );

  if (hasEmptyField) {
    throw new Error("Required fields cannot be empty.");
  }
});

eventSchema.index({ slug: 1 }, { unique: true });

const Event =
  models.Event ||
  model<InferSchemaType<typeof eventSchema>>("Event", eventSchema);

export default Event;
