'use server'; // server action file
import { Booking } from "@/database";
import connectToDatabase from "../mongodb";

interface CreateBookingParams {
  eventId: string;
  email: string;
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
    await connectToDatabase();
    await Booking.create({ eventId, email });

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