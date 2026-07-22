"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <section className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>

          <p className="text-gray-400">
            We couldn&apos;t load the application. This is usually temporary —
            try again in a moment.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={reset}
              className="rounded-lg bg-primary/80 px-6 py-3 font-medium text-black transition hover:bg-primary/70"
            >
              Try again
            </button>

            <Link
              href="/"
              className="rounded-lg border border-dark-200 px-6 py-3 font-medium transition hover:border-primary"
            >
              Back to Home
            </Link>
          </div>
        </section>
      </body>
    </html>
  );
}