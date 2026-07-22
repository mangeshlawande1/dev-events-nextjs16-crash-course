import EventCard from "@/components/EventCard";
import type { EventResponse } from "@/database/event.model";

interface EventsGridProps {
  events: EventResponse[];
  emptyMessage?: string;
}

const EventsGrid = ({
  events,
  emptyMessage = "No events match your search or filters. Try adjusting them.",
}: EventsGridProps) => {
  if (events.length === 0) {
    return <p className="text-center text-gray-400">{emptyMessage}</p>;
  }

  return (
    <ul className="events">
      {events.map((event) =>
        event.slug ? (
          <li key={event._id} className="list-none">
            <EventCard {...event} slug={event.slug} />
          </li>
        ) : null
      )}
    </ul>
  );
};

export default EventsGrid;
