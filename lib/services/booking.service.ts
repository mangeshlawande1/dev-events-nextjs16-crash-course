import {
  countBookingsByEventId,
  findBookingsByEmail,
  findBookingsByUserId,
} from "../repositories/booking.repository";

export async function getBookingCount(eventId: string) {
  return countBookingsByEventId(eventId);
}

export async function getBookingsByEmail(email: string) {
  return findBookingsByEmail(email);
}

export async function getBookingsByUserId(userId: string) {
  return findBookingsByUserId(userId);
}
