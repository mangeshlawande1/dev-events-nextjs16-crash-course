/**
Only talks to MongoDB.
No cache.
No "use server".

 */

import { Event } from "@/database";
import { connection } from 'next/server'; // Import from next/server

import connectToDatabase from "../mongodb";

export async function findAllEvents() {
  await connectToDatabase();

  const events = await Event.find().lean();
  return JSON.parse(JSON.stringify(events));
}

// export async function findEventBySlug(slug: string) {
//   await connectToDatabase();

//   const event = await Event.findOne({
//     slug: slug.trim().toLowerCase(),
//   }).lean();
//   return JSON.parse(JSON.stringify(event)); 
// }

export async function findEventBySlug(slug: string) {
  // 1. Explicitly signal to Next.js that this execution happens at request time
  await connection(); 

  // 2. Safely connect to the database (even if it internally uses Date.now())
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