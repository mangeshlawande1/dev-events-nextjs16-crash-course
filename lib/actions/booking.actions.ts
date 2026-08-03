'use server';

import { Booking, Event } from '@/database';
import connectToDatabase from '../mongodb';
import { isRegistrationClosed } from '../utils';
import { checkRateLimit, getClientIpFromHeaders } from '../rate-limit';
import { auth } from '../auth';

const BOOKING_RATE_LIMIT = 5;
const BOOKING_RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

interface CreateBookingParams {
  eventId: string;
  /** Required for guest bookings; ignored when logged in. */
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
    const ip = await getClientIpFromHeaders()

    const { allowed } = checkRateLimit(
      `booking:${ip}`,
      BOOKING_RATE_LIMIT,
      BOOKING_RATE_WINDOW_MS
    )

    if (!allowed) {
      return {
        success: false,
        message:
          'Too many booking attempts. Please try again in a few minutes.',
      }
    }

    await connectToDatabase()

    const session = await auth()
    const userId = session?.user?.id

    let effectiveEmail: string | undefined

    if (session) {
      // Authenticated users must use the email associated with their account.
      if (!session.user?.email) {
        return {
          success: false,
          message: 'Unable to determine your account email.',
        }
      }

      effectiveEmail = session.user.email
    } else {
      // Guests may provide an email address.
      effectiveEmail = email?.trim().toLowerCase()

      if (!effectiveEmail) {
        return {
          success: false,
          message: 'Email is required.',
        }
      }
    }

    const event = (await Event.findById(eventId)
      .select('capacity date time')
      .lean()) as {
      capacity: number
      date: string
      time: string
    } | null

    if (!event) {
      return { success: false, message: 'Event not found.' }
    }

    if (isRegistrationClosed(event.date, event.time)) {
      return {
        success: false,
        message: 'Registration for this event has closed.',
      }
    }

    // Small race-condition window under concurrent requests. Acceptable for
    // now; an atomic counter on Event would eliminate it completely.
    const currentBookings = await Booking.countDocuments({ eventId })

    if (currentBookings >= event.capacity) {
      return {
        success: false,
        message: 'This event is fully booked.',
      }
    }

    await Booking.create({
      eventId,
      email: effectiveEmail,
      userId,
    })

    return { success: true }
  } catch (error) {
    // Duplicate booking (unique index on eventId + email).
    if (
      error instanceof Error &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    ) {
      return {
        success: false,
        message: "You've already booked a spot for this event.",
      }
    }

    console.error('create booking failed', error)

    return {
      success: false,
      message: 'Failed to book your spot.',
    }
  }
}

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
    await connectToDatabase()

    const deleted = await Booking.findOneAndDelete({
      eventId,
      email: email.trim().toLowerCase(),
    })

    if (!deleted) {
      return {
        success: false,
        message:
          "We couldn't find a booking with that email for this event.",
      }
    }

    return { success: true }
  } catch (error) {
    console.error('cancel booking failed', error)

    return {
      success: false,
      message: 'Failed to cancel your booking.',
    }
  }
}