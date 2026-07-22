"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cancelBooking } from "@/lib/actions/booking.actions";
import type { BookingWithEvent } from "@/lib/repositories/booking.repository";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";

interface BookingsListProps {
  bookings: BookingWithEvent[];
  email: string;
}

const BookingsList = ({ bookings: initialBookings, email }: BookingsListProps) => {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const toast = useToast();
  const [bookings, setBookings] = useState(initialBookings);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = async (booking: BookingWithEvent) => {
    const confirmed = await confirm({
      title: `Cancel your booking for "${booking.event.title}"?`,
      confirmLabel: "Cancel Booking",
      cancelLabel: "Keep Booking",
      danger: true,
    });
    if (!confirmed) return;

    setCancellingId(booking._id);

    const { success, message } = await cancelBooking({
      eventId: booking.event._id,
      email,
    });

    if (success) {
      setBookings((prev) => prev.filter((b) => b._id !== booking._id));
      toast.success(`Booking for "${booking.event.title}" cancelled.`);
      router.refresh();
    } else {
      toast.error(message ?? "Failed to cancel this booking.");
    }

    setCancellingId(null);
  };

  if (bookings.length === 0) {
    return (
      <>
        {dialog}
        <p className="py-16 text-center text-gray-400">
          No bookings found for this email -{" "}
          <Link href="/#events" className="text-primary underline">
            browse events
          </Link>
          .
        </p>
      </>
    );
  }

  return (
    <div className="space-y-3">
      {dialog}

      <ul className="space-y-4">
        {bookings.map((booking) => {
          const isCancelling = cancellingId === booking._id;

          return (
            <li
              key={booking._id}
              className="flex flex-col gap-4 rounded-xl border border-dark-200 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <Link
                href={`/events/${booking.event.slug}`}
                className="flex items-center gap-4"
              >
                <Image
                  src={booking.event.image}
                  alt={booking.event.title}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-md object-cover"
                />
                <div>
                  <p className="font-medium">{booking.event.title}</p>
                  <p className="text-sm text-gray-400">
                    {booking.event.date} · {booking.event.time}
                  </p>
                  <p className="text-sm text-gray-400">
                    {booking.event.location}
                  </p>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => handleCancel(booking)}
                disabled={isCancelling}
                className="rounded-md border border-red-900/50 px-4 py-2 text-sm text-red-400 transition hover:border-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Cancel Booking"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default BookingsList;
