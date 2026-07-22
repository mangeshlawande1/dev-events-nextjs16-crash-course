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

export async function findAllEvents(
  page = 1,
  pageSize = EVENTS_PAGE_SIZE
): Promise<PaginatedEvents> {
  await connection();
  await connectToDatabase();

  const safePage = Math.max(1, Math.floor(page));
  const totalCount = await Event.countDocuments();
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const clampedPage = Math.min(safePage, totalPages);
  const skip = (clampedPage - 1) * pageSize;

  const events = await Event.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize)
    .lean();

  return {
    events: JSON.parse(JSON.stringify(events)),
    totalPages,
    currentPage: clampedPage,
  };
}

export async function findEventBySlug(slug: string) {
  // Explicitly signal to Next.js that this execution happens at request time.
  await connection();

  await connectToDatabase();

  const event = await Event.findOne({
    slug: slug.trim().toLowerCase(),
  }).lean();

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
  }).lean();
  return JSON.parse(JSON.stringify(similarEvents));
}