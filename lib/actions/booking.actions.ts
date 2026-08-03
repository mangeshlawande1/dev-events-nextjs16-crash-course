'use server'; // server action file
import { Booking, Event } from "@/database";
import connectToDatabase from "../mongodb";
import { isRegistrationClosed } from "../utils";
import { checkRateLimit, getClientIpFromHeaders } from "../rate-limit";
import { auth } from "../auth";

const BOOKING_RATE_LIMIT = 5;
const BOOKING_RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

interface CreateBookingParams {
  eventId: string;
  /** Required for guest bookings; ignored/overridden when logged in. */
  email?: string;
}

interface CreateBookingResult {
  success: boolean;
  message?: string;
}

export const createBooking = async ({
  eventId,
  email,
}: CreateBookingParams): Promise<CreateBookingResult> => {
  try {
    const ip = await getClientIpFromHeaders();
    const { allowed } = checkRateLimit(
      `booking:${ip}`,
      BOOKING_RATE_LIMIT,
      BOOKING_RATE_WINDOW_MS
    );

    if (!allowed) {
      return {
        success: false,
        message: "Too many booking attempts. Please try again in a few minutes.",
      };
    }

    await connectToDatabase();

    const session = await auth();

    // When logged in, the account's own email is authoritative - never
    // trust a client-passed email instead, or a logged-in user could book
    // under a fake email while authenticated, defeating the point of
    // having an account at all.
    const effectiveEmail = session?.user?.email ?? email;
    const userId = session?.user?.id;

    if (!effectiveEmail) {
      return { success: false, message: "Email is required." };
    }

    const event = (await Event.findById(eventId)
      .select("capacity date time")
      .lean()) as { capacity: number; date: string; time: string } | null;

    if (!event) {
      return { success: false, message: "Event not found." };
    }

    if (isRegistrationClosed(event.date, event.time)) {
      return {
        success: false,
        message: "Registration for this event has closed.",
      };
    }

    // Note: there's a small race-condition window here under high concurrent
    // load (two requests could both pass this check before either inserts).
    // Acceptable at this scale; an atomic counter on Event would close it
    // fully if that ever becomes a real concern.
    const currentBookings = await Booking.countDocuments({ eventId });

    if (currentBookings >= event.capacity) {
      return { success: false, message: "This event is fully booked." };
    }

    await Booking.create({ eventId, email: effectiveEmail, userId });

    return { success: true };
  } catch (error) {
    // Duplicate booking (unique index on eventId+email) gets a clear message.
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return {
        success: false,
        message: "You've already booked a spot for this event.",
      };
    }

    console.error("create booking failed", error);
    return { success: false, message: "Failed to book your spot." };
  }
};

interface CancelBookingParams {
  eventId: string;
  email: string;
}

interface CancelBookingResult {
  success: boolean;
  message?: string;
}

export const cancelBooking = async ({
  eventId,
  email,
}: CancelBookingParams): Promise<CancelBookingResult> => {
  try {
    await connectToDatabase();

    const deleted = await Booking.findOneAndDelete({
      eventId,
      email: email.trim().toLowerCase(),
    });

    if (!deleted) {
      return {
        success: false,
        message: "We couldn't find a booking with that email for this event.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("cancel booking failed", error);
    return { success: false, message: "Failed to cancel your booking." };
  }
};