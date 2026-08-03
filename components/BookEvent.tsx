'use client';
import { createBooking, cancelBooking } from "@/lib/actions/booking.actions";
import { useState } from "react"
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import posthog from "posthog-js";
import { useToast } from "@/hooks/useToast";

/// props structure layout interface 
interface BookEventProps {
    eventId : string;
    slug: string;
    isFull?: boolean;
    isClosed?: boolean;
}

type ViewMode = "book" | "cancel";

const BookEvent = ({eventId, slug, isFull = false, isClosed = false}:BookEventProps ) => {
    const router = useRouter();
    const toast = useToast();
    const { data: session, status } = useSession();
    const isLoggedIn = status === "authenticated";

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [view, setView] = useState<ViewMode>("book");
    const [cancelEmail, setCancelEmail] = useState('');
    const [cancelling, setCancelling] = useState(false);

    const isUnavailable = isFull || isClosed;

    // Logged-in bookings always use the account's own email - the server
    // action enforces this too, but there's no email input to show at all
    // here, since asking someone who's already authenticated to retype
    // their own email adds friction for no benefit.
    const handleBookAsAccount = async () => {
        setLoading(true);
        setError('');

        const { success, message } = await createBooking({ eventId });

        if (success) {
            const bookedEmail = session?.user?.email ?? '';
            posthog.capture('event_booked', { eventId, slug, email: bookedEmail });
            router.push(
                `/events/${slug}/booked?email=${encodeURIComponent(bookedEmail)}`
            );
        } else {
            setError(message ?? 'Booking failed. Please try again.');
            posthog.captureException(new Error(message ?? 'Booking creation failed'));
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // prevent default behaviour of the browser to reload
        if (!email.trim() || isUnavailable) return;

        setLoading(true);
        setError('');

        const { success, message } = await createBooking({ eventId, email });

        if (success) {
            posthog.capture('event_booked', { eventId, slug, email });
            // A dedicated, addressable confirmation page - survives a
            // refresh and can be bookmarked/shared, unlike an inline state flip.
            router.push(
                `/events/${slug}/booked?email=${encodeURIComponent(email.trim())}`
            );
        } else {
            setError(message ?? 'Booking failed. Please try again.');
            posthog.captureException(new Error(message ?? 'Booking creation failed'));
            setLoading(false);
        }
    };

    const runCancel = async (emailToCancel: string) => {
        if (!emailToCancel.trim()) return;

        setCancelling(true);

        const { success, message } = await cancelBooking({
            eventId,
            email: emailToCancel,
        });

        if (success) {
            toast.success('Your booking has been cancelled.');
            posthog.capture('event_booking_cancelled', { eventId, slug });
            setView("book");
            setCancelEmail('');
            // Refresh so seats-remaining reflects the cancellation immediately.
            router.refresh();
        } else {
            toast.error(message ?? 'Failed to cancel your booking.');
        }

        setCancelling(false);
    };

    // Logged-in visitors already have a known email - one click, no form.
    const handleCancelAsAccount = () => runCancel(session?.user?.email ?? '');

    // Guest flow - they have to tell us who they are.
    const handleCancelForm = async (e: React.FormEvent) => {
        e.preventDefault();
        await runCancel(cancelEmail);
    };

    if (view === "cancel") {
        if (isLoggedIn) {
            return (
                <div id="book-event">
                    <button
                        type="button"
                        onClick={handleCancelAsAccount}
                        disabled={cancelling}
                        className="button-submit"
                    >
                        {cancelling ? 'Cancelling...' : `Cancel booking for ${session?.user?.email}`}
                    </button>
                    <button
                        type="button"
                        onClick={() => setView("book")}
                        className="mt-2 text-sm text-gray-400 underline"
                    >
                        Back
                    </button>
                </div>
            );
        }

        return (
            <div id="book-event">
                <form onSubmit={handleCancelForm}>
                    <div>
                        <label htmlFor="cancel-email">Email Address</label>
                        <input
                            type="email"
                            required
                            value={cancelEmail}
                            onChange={(e) => setCancelEmail(e.target.value)}
                            id="cancel-email"
                            placeholder="Enter the email you booked with"
                        />
                    </div>
                    <button className="button-submit" type="submit" disabled={cancelling}>
                        {cancelling ? 'Cancelling...' : 'Cancel my booking'}
                    </button>
                </form>
                <button
                    type="button"
                    onClick={() => setView("book")}
                    className="mt-2 text-sm text-gray-400 underline"
                >
                    Back
                </button>
            </div>
        );
    }

    // Parent already shows a status message (full/closed) above this
    // component - but an existing booking should still be cancellable
    // even once the event is full or has passed.
    if (isUnavailable) {
        return (
            <div id="book-event">
                <button
                    type="button"
                    onClick={() => setView("cancel")}
                    className="text-sm text-gray-400 underline"
                >
                    Already registered? Cancel your booking
                </button>
            </div>
        );
    }

    if (isLoggedIn) {
        return (
            <div id="book-event">
                <p className="text-sm text-gray-400">
                    Booking as <span className="text-foreground">{session?.user?.email}</span>
                </p>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <button
                    type="button"
                    onClick={handleBookAsAccount}
                    disabled={loading}
                    className="button-submit"
                >
                    {loading ? 'Submitting...' : 'Book This Event'}
                </button>
                <button
                    type="button"
                    onClick={() => setView("cancel")}
                    className="mt-2 text-sm text-gray-400 underline"
                >
                    Already registered? Cancel your booking
                </button>
            </div>
        );
    }

  return (
    <div id="book-event">
           <form onSubmit={handleSubmit}>
            <div >
                <label htmlFor="email">Email Address</label>
                <input 
                type="email" 
                required 
                value={email}
                onChange={ (e) => setEmail(e.target.value)}
                id="email"
                placeholder="Enter Your email address" />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button className="button-submit" type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit'}
            </button>
           </form>
        <button
            type="button"
            onClick={() => setView("cancel")}
            className="mt-2 text-sm text-gray-400 underline"
        >
            Already registered? Cancel your booking
        </button>
    </div>
  )
}

export default BookEvent
