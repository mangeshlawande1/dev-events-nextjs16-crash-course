import type { Metadata } from "next";
import BookingsList from "@/components/bookings/BookingsList";
import { getBookingsByEmail } from "@/lib/services/booking.service";

export const metadata: Metadata = {
  title: "My Bookings | Dev Event",
  description: "Look up and manage the events you've booked.",
};

interface BookingsPageProps {
  searchParams: Promise<{ email?: string }>;
}

const BookingsPage = async ({ searchParams }: BookingsPageProps) => {
  const { email } = await searchParams;
  const normalizedEmail = email?.trim().toLowerCase();

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-center">My Bookings</h1>
      <p className="mt-5 text-center text-gray-400">
        Enter the email you booked with to see and manage your bookings.
      </p>

      {/*
        Plain GET form - no client JS needed for the lookup itself, and the
        result is a shareable/bookmarkable URL, same pattern as ?page= on
        the homepage and dashboard.
      */}
      <form action="/bookings" method="GET" className="mt-10 flex gap-3">
        <label htmlFor="email" className="sr-only">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={normalizedEmail}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-dark-200 bg-dark-200 px-4 py-3 outline-none transition focus:border-primary"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary/80 px-6 py-3 font-medium text-black transition hover:bg-primary/70"
        >
          Find
        </button>
      </form>

      {normalizedEmail && (
        <div className="mt-10">
          <BookingsListSection email={normalizedEmail} />
        </div>
      )}
    </section>
  );
};

const BookingsListSection = async ({ email }: { email: string }) => {
  const bookings = await getBookingsByEmail(email);

  return <BookingsList bookings={bookings} email={email} />;
};

export default BookingsPage;
