import { notFound } from "next/navigation";

import EventForm from "@/components/forms/EventForm";
import { getEventForEdit } from "@/lib/services/event.service";
import type { EventResponse } from "@/database/event.model";

interface EditEventPageProps {
  params: Promise<{ slug: string }>;
}

/** Native <input type="date"> requires exactly YYYY-MM-DD. */
function toDateInputValue(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

const EditEventPage = async ({ params }: EditEventPageProps) => {
  const { slug } = await params;
  const event: EventResponse | null = await getEventForEdit(slug);

  if (!event) {
    notFound();
  }

  return (
    <section className="px-6 py-16">
      <EventForm
        mode="edit"
        eventSlug={event.slug ?? slug}
        initialData={{
          title: event.title,
          description: event.description,
          overview: event.overview,
          image: event.image,
          venue: event.venue,
          location: event.location,
          date: toDateInputValue(event.date),
          time: event.time,
          mode: event.mode,
          audience: event.audience,
          capacity: event.capacity,
          organizer: event.organizer,
          agenda: event.agenda,
          tags: event.tags,
          status: event.status,
        }}
      />
    </section>
  );
};

export default EditEventPage;
