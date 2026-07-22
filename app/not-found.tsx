import Link from "next/link";

const NotFound = () => {
  return (
    <section className="mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-32 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-gray-400">
        The event or page you&apos;re looking for doesn&apos;t exist, or may
        have been removed.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-lg bg-primary/80 px-6 py-3 font-medium text-black transition hover:bg-primary/70"
        >
          Back to Home
        </Link>
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

export default NotFound;
