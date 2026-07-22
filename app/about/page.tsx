import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | Dev Event",
  description:
    "Dev Event is the hub for every developer conference, hackathon, and meetup - discover events, or host your own.",
};

const values = [
  {
    title: "Discover",
    body: "Browse hackathons, meetups, and conferences from communities and organizers around the world, all in one feed.",
  },
  {
    title: "Book in seconds",
    body: "No accounts, no friction. Drop your email and you're on the list.",
  },
  {
    title: "Host your own",
    body: "Organizers can publish an event with a banner, agenda, and audience details in minutes.",
  },
];

const AboutPage = () => {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-center">About Dev Event</h1>
      <p className="mt-5 text-center text-gray-400">
        Dev Event is the hub for every dev event you can&apos;t miss.
      </p>

      <div className="mt-16 space-y-6 text-gray-300">
        <p>
          We built Dev Event because finding out about the right conference,
          hackathon, or meetup shouldn&apos;t mean scrolling through five
          different platforms. Whether you&apos;re a developer looking for
          your next event or a community organizer trying to reach the right
          audience, Dev Event brings both sides together in one place.
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {values.map((value) => (
          <div
            key={value.title}
            className="rounded-xl border border-dark-200 bg-dark-100/60 p-6"
          >
            <h3 className="text-lg font-medium text-primary">
              {value.title}
            </h3>
            <p className="mt-2 text-sm text-gray-400">{value.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 flex flex-col items-center gap-4 text-center">
        <p className="text-gray-400">Ready to jump in?</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/#events"
            className="rounded-lg bg-primary/80 px-6 py-3 font-medium text-black transition hover:bg-primary/70"
          >
            Browse Events
          </Link>
          <Link
            href="/events/create"
            className="rounded-lg border border-dark-200 px-6 py-3 font-medium transition hover:border-primary"
          >
            Create an Event
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AboutPage;
