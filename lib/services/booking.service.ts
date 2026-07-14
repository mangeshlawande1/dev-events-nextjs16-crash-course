import { countBookingsByEventId } from "../repositories/booking.repository";

export async function getBookingCount(eventId: string) {
  return countBookingsByEventId(eventId);
}
