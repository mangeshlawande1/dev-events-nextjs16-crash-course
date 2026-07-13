// import { Event } from "@/database";
// import connectToDatabase from "../mongodb";
// import {cacheLife, cacheTag} from "next/cache";


// export const getAllEvents = async () => {
//   await connectToDatabase();

//   const events = await Event.find().lean();
//   return events;
// };


// export const getEventBySlug = async (slug: string) => {
//       "use cache";
//         cacheLife("hours");
//         cacheTag(`event:${slug}`);

//   try {


//     await connectToDatabase();

//     const normalizedSlug = slug.trim().toLowerCase();

//     const event = await Event.findOne({
//       slug: normalizedSlug,
//     }).lean();

//     if (!event) return null;

//     return JSON.parse(JSON.stringify(event));
//   } catch (error) {
//     console.error("Error getting event:", error);
//     return null;
//   }
// };

// export const getSimilarEventsBySlug = async (slug: string) => {
//   try {
//     await connectToDatabase();

//     const normalizedSlug = slug.trim().toLowerCase();

//     const event = await Event.findOne({ slug: normalizedSlug });

//     if (!event) return [];

//     const similarEvents = await Event.find({
//       _id: { $ne: event._id },
//       tags: { $in: event.tags },
//     }).lean();

//     return JSON.parse(JSON.stringify(similarEvents));
//   } catch (error) {
//     console.error("Error getting similar events:", error);
//     return [];
//   }
// };