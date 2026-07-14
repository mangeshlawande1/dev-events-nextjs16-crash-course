/**
Only talks to MongoDB.
No cache.
No "use server".
*/

import { Booking } from "@/database";
import { connection } from "next/server";

import connectToDatabase from "../mongodb";

export async function countBookingsByEventId(eventId: string): Promise<number> {
  await connection();
  await connectToDatabase();

  return Booking.countDocuments({ eventId });
}
