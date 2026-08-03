/**
Only talks to MongoDB.
No cache.
No "use server".

 */

import { Event } from "@/database";
import type { EventResponse } from "@/database/event.model";
import { connection } from 'next/server'; // Import from next/server

import connectToDatabase from "../mongodb";

export const EVENTS_PAGE_SIZE = 9;

export interface PaginatedEvents {
  events: EventResponse[];
  totalPages: number;
  currentPage: number;
}

interface StatusFilterOptions {
  /** Dashboard/edit contexts need drafts too; public pages don't. */
  includeDrafts?: boolean;
  /** Scopes results to one owner - organizers see only their own events on the dashboard. */
  createdBy?: string;
}

export type EventSortOption = "latest" | "upcoming" | "popular";

export interface EventQueryFilters {
  /** Free-text search across title/description/location/tags. */
  query?: string;
  location?: string;
  mode?: "online" | "offline" | "hybrid";
  tag?: string;
  sort?: EventSortOption;
}

/** Escapes regex special characters so user input can't break/inject into the pattern. */
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildMatchFilter(
  { includeDrafts = false, createdBy }: StatusFilterOptions,
  { query, location, mode, tag, sort }: EventQueryFilters
): Record<string, unknown> {
  const filter: Record<string, unknown> = includeDrafts
    ? {}
    : { status: "published" };

  if (createdBy) {
    filter.createdBy = createdBy;
  }

  if (location) {
    filter.location = { $regex: escapeRegex(location), $options: "i" };
  }

  if (mode) {
    filter.mode = mode;
  }

  if (tag) {
    filter.tags = tag;
  }

  if (sort === "upcoming") {
    // "Upcoming" should mean upcoming - exclude events that have already happened.
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    filter.date = { $gte: todayStart.toISOString() };
  }

  if (query) {
    const regex = { $regex: escapeRegex(query), $options: "i" };
    filter.$or = [
      { title: regex },
      { description: regex },
      { location: regex },
      { tags: regex },
    ];
  }

  return filter;
}

export async function findAllEvents(
  page = 1,
  pageSize = EVENTS_PAGE_SIZE,
  statusOptions: StatusFilterOptions = {},
  filters: EventQueryFilters = {}
): Promise<PaginatedEvents> {
  await connection();
  await connectToDatabase();

  const matchFilter = buildMatchFilter(statusOptions, filters);

  const safePage = Math.max(1, Math.floor(page));
  const totalCount = await Event.countDocuments(matchFilter);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const clampedPage = Math.min(safePage, totalPages);
  const skip = (clampedPage - 1) * pageSize;

  let events;

  if (filters.sort === "popular") {
    // Booking count isn't a stored field on Event, so ranking by it needs
    // an aggregation ($lookup against the bookings collection) rather
    // than a plain find().sort().
    events = await Event.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: "bookings",
          localField: "_id",
          foreignField: "eventId",
          as: "bookings",
        },
      },
      { $addFields: { bookingCount: { $size: "$bookings" } } },
      { $project: { bookings: 0 } },
      { $sort: { bookingCount: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: pageSize },
    ]);
  } else {
    const sortSpec: Record<string, 1 | -1> =
      filters.sort === "upcoming" ? { date: 1 } : { createdAt: -1 };

    events = await Event.find(matchFilter)
      .sort(sortSpec)
      .skip(skip)
      .limit(pageSize)
      .lean();
  }

  return {
    events: JSON.parse(JSON.stringify(events)),
    totalPages,
    currentPage: clampedPage,
  };
}

export interface EventFilterOptions {
  locations: string[];
  tags: string[];
}

/** Distinct values for the filter dropdowns - published events only. */
export async function getFilterOptions(): Promise<EventFilterOptions> {
  await connection();
  await connectToDatabase();

  const [locations, tags] = await Promise.all([
    Event.distinct("location", { status: "published" }),
    Event.distinct("tags", { status: "published" }),
  ]);

  return {
    locations: locations.filter(Boolean).sort(),
    tags: tags.filter(Boolean).sort(),
  };
}

export interface EventSuggestion {
  title: string;
  slug: string;
  image: string;
  date: string;
}

/** Lightweight typeahead - just enough fields to render a suggestion row. */
export async function findEventSuggestions(
  query: string,
  limit = 5
): Promise<EventSuggestion[]> {
  await connection();
  await connectToDatabase();

  const trimmed = query.trim();
  if (!trimmed) return [];

  const regex = { $regex: escapeRegex(trimmed), $options: "i" };

  const events = await Event.find({
    status: "published",
    $or: [{ title: regex }, { tags: regex }, { location: regex }],
  })
    .select("title slug image date")
    .limit(limit)
    .lean();

  return JSON.parse(JSON.stringify(events));
}

const TRENDING_WINDOW_DAYS = 7;
const TRENDING_LIMIT = 6;

/**
 * "Trending" = recent booking momentum (last 7 days), not all-time count -
 * otherwise this would just duplicate the sort=popular option forever.
 * Only surfaces events that haven't happened yet (no point trending a
 * dead-end that can no longer be booked).
 */
export async function findTrendingEvents(
  limit = TRENDING_LIMIT,
  windowDays = TRENDING_WINDOW_DAYS
): Promise<EventResponse[]> {
  await connection();
  await connectToDatabase();

  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - windowDays);

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const events = await Event.aggregate([
    {
      $match: {
        status: "published",
        date: { $gte: todayStart.toISOString() },
      },
    },
    {
      $lookup: {
        from: "bookings",
        let: { eventId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$eventId", "$$eventId"] },
              createdAt: { $gte: windowStart },
            },
          },
        ],
        as: "recentBookings",
      },
    },
    { $addFields: { recentBookingCount: { $size: "$recentBookings" } } },
    { $match: { recentBookingCount: { $gt: 0 } } },
    { $project: { recentBookings: 0 } },
    { $sort: { recentBookingCount: -1, createdAt: -1 } },
    { $limit: limit },
  ]);

  return JSON.parse(JSON.stringify(events));
}

export async function findEventBySlug(
  slug: string,
  { includeDrafts = false }: StatusFilterOptions = {}
) {
  // Explicitly signal to Next.js that this execution happens at request time.
  await connection();

  await connectToDatabase();

  const filter = {
    slug: slug.trim().toLowerCase(),
    ...(includeDrafts ? {} : { status: "published" }),
  };

  const event = await Event.findOne(filter).lean();

  return JSON.parse(JSON.stringify(event));
}


export async function findSimilarEvents(slug: string) {

  await connection();

  await connectToDatabase();

  const event = await Event.findOne({
    slug: slug.trim().toLowerCase(),
  });

  if (!event) return [];

  const similarEvents = await Event.find({
    _id: { $ne: event._id },
    tags: { $in: event.tags },
    status: "published",
  }).lean();
  return JSON.parse(JSON.stringify(similarEvents));
}
