import {
  Schema,
  model,
  models,
  Document,
  Types,
} from "mongoose";
import Event from "./event.model";

export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  userId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
      index: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: (email: string): boolean =>
          EMAIL_REGEX.test(email),
        message: "Please provide a valid email address",
      },
    },

    /** Present when the booker was logged in; absent for guest bookings. */
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Verify that the referenced Event exists before
 * creating or updating a booking.
 */
BookingSchema.pre("save", async function () {
  // Skip database lookup if eventId wasn't changed.
  if (!this.isModified("eventId") && !this.isNew) {
    return;
  }

  const eventExists = await Event.exists({
    _id: this.eventId,
  });

  if (!eventExists) {
    throw new Error(
      `Event with ID ${this.eventId} does not exist`
    );
  }
});

/**
 * Indexes for common query patterns.
 */
BookingSchema.index({ eventId: 1, createdAt: -1 });
BookingSchema.index({ email: 1 });

/**
 * Prevent duplicate registrations for the same event.
 */
BookingSchema.index(
  { eventId: 1, email: 1 },
  {
    unique: true,
    name: "uniq_event_email",
  }
);

const Booking =
  models.Booking ||
  model<IBooking>("Booking", BookingSchema);

export default Booking;