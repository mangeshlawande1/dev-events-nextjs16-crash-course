"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelBooking } from "@/lib/actions/booking.actions";
import { useToast } from "@/hooks/useToast";

interface BookingSuccessCancelButtonProps {
  eventId: string;
  email: string;
}

const BookingSuccessCancelButton = ({
  eventId,
  email,
}: BookingSuccessCancelButtonProps) => {
  const router = useRouter();
  const toast = useToast();
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);

    const { success, message } = await cancelBooking({ eventId, email });

    if (success) {
      setCancelled(true);
      router.refresh();
    } else {
      toast.error(message ?? "Failed to cancel your booking.");
    }

    setCancelling(false);
  };

  if (cancelled) {
    return (
      <p className="text-sm text-gray-400">
        Your booking has been cancelled.
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={cancelling}
      className="text-sm text-red-400 underline disabled:opacity-50"
    >
      {cancelling ? "Cancelling..." : "Cancel my booking"}
    </button>
  );
};

export default BookingSuccessCancelButton;
