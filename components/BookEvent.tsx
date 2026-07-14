'use client';
import { createBooking } from "@/lib/actions/booking.actions";
import { useState } from "react"
import posthog from "posthog-js";

/// props structure layout interface 
interface BookEventProps {
    eventId : string;
    slug: string;
}

const BookEvent = ({eventId, slug}:BookEventProps ) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // prevent default behaviour of the browser to reload
        if (!email.trim()) return;

        setLoading(true);
        setError('');

        const { success, message } = await createBooking({ eventId, email });

        if (success) {
            setSubmitted(true);
            posthog.capture('event_booked', { eventId, slug, email });
        } else {
            setError(message ?? 'Booking failed. Please try again.');
            posthog.captureException(new Error(message ?? 'Booking creation failed'));
        }

        setLoading(false);
    };
  return (
    <div id="book-event">
        {submitted ? (
            <p className="text-sm">
                Thank you For signing up !
            </p>
        ) : (
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
        ) }
    </div>
  )
}

export default BookEvent