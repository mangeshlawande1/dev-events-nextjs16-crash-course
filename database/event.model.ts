import {
  Schema,
  model,
  models,
  InferSchemaType,
  HydratedDocument,
} from "mongoose";

/**
 * Generate a URL-friendly slug from a title.
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Normalize a date into ISO format.
 */
function normalizeDate(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date format.");
  }

  return date.toISOString();
}

/**
 * Normalize time into HH:mm (24-hour format).
 */
function normalizeTime(timeString: string): string {
  const regex = /^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i;
  const match = timeString.trim().match(regex);

  if (!match) {
    throw new Error(
      "Invalid time format. Use HH:mm or HH:mm AM/PM."
    );
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3]?.toUpperCase();

  if (period) {
    if (period === "PM" && hours !== 12) {
      hours += 12;
    }

    if (period === "AM" && hours === 12) {
      hours = 0;
    }
  }

  if (
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error("Invalid time value.");
  }

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
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
      required: true,
      unique: true,
      lowercase: true,
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
    },

    time: {
      type: String,
      required: true,
    },

    mode: {
      type: String,
      required: true,
      lowercase: true,
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
        validator: (v: string[]) =>
          v.length > 0 &&
          v.every((item) => item.trim().length > 0),
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
        validator: (v: string[]) =>
          v.length > 0 &&
          v.every((item) => item.trim().length > 0),
        message: "Tags cannot be empty.",
      },
    },
  },
  {
    timestamps: true,
  }
);

export type Event = InferSchemaType<typeof eventSchema>;
export type EventDocument = HydratedDocument<Event>;

/**
 * Generate slug and normalize date/time before saving.
 */
eventSchema.pre("save", async function () {
  const event = this as EventDocument;

  if (event.isModified("title") || event.isNew) {
    event.slug = generateSlug(event.title);
  }

  if (event.isModified("date")) {
    event.date = normalizeDate(event.date);
  }

  if (event.isModified("time")) {
    event.time = normalizeTime(event.time);
  }
});

eventSchema.index({ slug: 1 }, { unique: true });
eventSchema.index({ date: 1, mode: 1 });

const EventModel =
  models.Event ||
  model<Event>("Event", eventSchema);

export default EventModel;