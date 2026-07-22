/**
Only talks to MongoDB.
No cache.
No "use server".
*/

import { Booking } from "@/database";
import type { EventResponse } from "@/database/event.model";
import { connection } from "next/server";

import connectToDatabase from "../mongodb";

export async function countBookingsByEventId(eventId: string): Promise<number> {
  await connection();
  await connectToDatabase();

  return Booking.countDocuments({ eventId });
}

export interface BookingWithEvent {
  _id: string;
  email: string;
  createdAt: string;
  event: EventResponse;
}

export async function findBookingsByEmail(
  email: string
): Promise<BookingWithEvent[]> {
  await connection();
  await connectToDatabase();

  const normalizedEmail = email.trim().toLowerCase();

  const bookings = await Booking.find({ email: normalizedEmail })
    .sort({ createdAt: -1 })
    .populate("eventId")
    .lean();

  // Defensive: skip any booking whose event no longer exists (shouldn't
  // happen, since deleting an event cascades to its bookings, but a null
  // populate() result would otherwise crash the mapping below).
  const withEvent = bookings.filter(
    (booking) => booking.eventId && typeof booking.eventId === "object"
  );

  return JSON.parse(
    JSON.stringify(
      withEvent.map((booking) => ({
        _id: booking._id,
        email: booking.email,
        createdAt: booking.createdAt,
        event: booking.eventId,
      }))
    )
  );
}
