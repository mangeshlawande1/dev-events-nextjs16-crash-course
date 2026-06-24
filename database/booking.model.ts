import {
  Schema,
  model,
  models,
  Types,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";
import Event from "./event.model";

const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bookingSchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value: string) => EMAIL_REGEX.test(value),
        message: "Invalid email address.",
      },
    },
  },
  {
    timestamps: true,
  }
);

export type BookingDocument = HydratedDocument<
  InferSchemaType<typeof bookingSchema>
>;

/**
 * Ensure the referenced event exists before creating
 * a booking to avoid orphaned records.
 */

bookingSchema.pre("save", async function () {
  const booking = this as BookingDocument;

  if (!Types.ObjectId.isValid(booking.eventId)) {
    throw new Error("Invalid event id.");
  }

  const eventExists = await Event.exists({
    _id: booking.eventId,
  });

  if (!eventExists) {
    throw new Error("Referenced event does not exist.");
  }
});

const Booking =
  models.Booking ||
  model<InferSchemaType<typeof bookingSchema>>(
    "Booking",
    bookingSchema
  );

export default Booking;