"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import type { EventFilterOptions } from "@/lib/repositories/event.repository";

interface EventsFilterBarProps {
  filterOptions: EventFilterOptions;
}

const modeOptions = [
  { value: "", label: "All Modes" },
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
  { value: "hybrid", label: "Hybrid" },
];

const sortOptions = [
  { value: "latest", label: "Latest" },
  { value: "upcoming", label: "Upcoming" },
  { value: "popular", label: "Most Booked" },
];

const EventsFilterBar = ({ filterOptions }: EventsFilterBarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      // Any filter change invalidates whatever page you were on.
      params.delete("page");

      const queryString = params.toString();
      router.push(`${pathname}${queryString ? `?${queryString}` : ""}#events`);
    },
    [pathname, router, searchParams]
  );

  return (
    <div className="flex flex-col gap-4">
      <SearchBar
        onSearch={(value) => updateParam("q", value)}
        placeholder="Search events, tags, or location..."
        defaultValue={searchParams.get("q") ?? ""}
      />

      <div className="flex flex-wrap items-center justify-center gap-3">
        <select
          aria-label="Filter by location"
          defaultValue={searchParams.get("location") ?? ""}
          onChange={(e) => updateParam("location", e.target.value)}
          className="rounded-lg border border-dark-200 bg-dark-200 px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="">All Locations</option>
          {filterOptions.locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by mode"
          defaultValue={searchParams.get("mode") ?? ""}
          onChange={(e) => updateParam("mode", e.target.value)}
          className="rounded-lg border border-dark-200 bg-dark-200 px-3 py-2 text-sm outline-none focus:border-primary"
        >
          {modeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by tag"
          defaultValue={searchParams.get("tag") ?? ""}
          onChange={(e) => updateParam("tag", e.target.value)}
          className="rounded-lg border border-dark-200 bg-dark-200 px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="">All Tags</option>
          {filterOptions.tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>

        <select
          aria-label="Sort events"
          defaultValue={searchParams.get("sort") ?? "latest"}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="rounded-lg border border-dark-200 bg-dark-200 px-3 py-2 text-sm outline-none focus:border-primary"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default EventsFilterBar;
