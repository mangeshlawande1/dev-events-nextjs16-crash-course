import { countBookingsByEventId, findBookingsByEmail } from "../repositories/booking.repository";

export async function getBookingCount(eventId: string) {
  return countBookingsByEventId(eventId);
}

export async function getBookingsByEmail(email: string) {
  return findBookingsByEmail(email);
}
