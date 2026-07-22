"use client";

import { useEffect } from "react";
import Link from "next/link";

const EventDetailError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    console.error("Event detail error:", error);
  }, [error]);

  return (
    <section className="mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-32 text-center">
      <h1 className="text-2xl font-semibold">Couldn&apos;t load this event</h1>
      <p className="text-gray-400">
        Something went wrong while fetching this event. It might be
        temporary - try again, or head back and browse other events.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={reset}
          className="rounded-lg bg-primary/80 px-6 py-3 font-medium text-black transition hover:bg-primary/70"
        >
          Try again
        </button>
        <Link
          href="/#events"
          className="rounded-lg border border-dark-200 px-6 py-3 font-medium transition hover:border-primary"
        >
          Browse Events
        </Link>
      </div>
    </section>
  );
};

export default EventDetailError;
