import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import BookingSuccessCancelButton from "@/components/bookings/BookingSuccessCancelButton";
import { getEventBySlug } from "@/lib/services/event.service";

interface BookingSuccessPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ email?: string }>;
}

const BookingSuccessPage = async ({
  params,
  searchParams,
}: BookingSuccessPageProps) => {
  const { slug } = await params;
  const { email } = await searchParams;

  const event = await getEventBySlug(slug);

  if (!event || !email) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-xl px-6 py-16 text-center">
      <p className="text-sm font-medium text-primary">Booking Confirmed</p>
      <h1 className="mt-2">You&apos;re going to {event.title}!</h1>
      <p className="mt-3 text-gray-400">
        A confirmation has been noted for <strong>{email}</strong>.
      </p>

      <div className="mt-10 flex flex-col items-center gap-4 rounded-xl border border-dark-200 p-6 text-left sm:flex-row">
        <Image
          src={event.image}
          alt={event.title}
          width={96}
          height={96}
          className="h-24 w-24 rounded-md object-cover"
        />
        <div>
          <p className="font-medium">{event.title}</p>
          <p className="text-sm text-gray-400">
            {event.date} · {event.time}
          </p>
          <p className="text-sm text-gray-400">{event.location}</p>
        </div>
      </div>

      <div className="mt-8">
        <BookingSuccessCancelButton eventId={event._id} email={email} />
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href={`/bookings?email=${encodeURIComponent(email)}`}
          className="rounded-lg bg-primary/80 px-6 py-3 font-medium text-black transition hover:bg-primary/70"
        >
          Manage My Bookings
        </Link>
        <Link
          href="/#events"
          className="rounded-lg border border-dark-200 px-6 py-3 font-medium transition hover:border-primary"
        >
          Browse More Events
        </Link>
      </div>
    </section>
  );
};

export default BookingSuccessPage;
