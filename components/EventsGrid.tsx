"use client";

import { useMemo, useState } from "react";
import EventCard from "@/components/EventCard";
import SearchBar from "@/components/SearchBar";
import type { EventResponse } from "@/database/event.model";

interface EventsGridProps {
  events: EventResponse[];
}

function matchesQuery(event: EventResponse, query: string): boolean {
  const haystack = [event.title, event.location, ...(event.tags ?? [])]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

const EventsGrid = ({ events }: EventsGridProps) => {
  const [query, setQuery] = useState("");

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return events;

    return events.filter((event) => matchesQuery(event, normalizedQuery));
  }, [events, query]);

  return (
    <div className="space-y-10">
      <SearchBar onSearch={setQuery} />

      {filteredEvents.length === 0 ? (
        <p className="text-center text-gray-400">
          {events.length === 0
            ? "No events yet - be the first to create one."
            : `No events match "${query}". Try a different search.`}
        </p>
      ) : (
        <ul className="events">
          {filteredEvents.map((event) =>
            event.slug ? (
              <li key={event._id} className="list-none">
                <EventCard {...event} slug={event.slug} />
              </li>
            ) : null
          )}
        </ul>
      )}
    </div>
  );
};

export default EventsGrid;
