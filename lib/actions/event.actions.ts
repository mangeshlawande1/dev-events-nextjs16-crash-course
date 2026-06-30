'use server'

import { Event } from "@/database";
import connectToDatabase from "../mongodb";

export const gedtSimilarEventsBySlug = async (slug: string) => {
    try {
        await connectToDatabase();
        const event = await Event.findOne({ slug });
        
        if (!event) return [];

        // Changed from findOne to find to get an array of events
        const similarEvents = await Event.find({ 
            _id: { $ne: event._id }, 
            tags: { $in: event.tags }  
        }).lean(); // .lean() turns Mongoose documents into plain JS objects

        return JSON.parse(JSON.stringify(similarEvents)); // Safely serializes ObjectIds
    } catch (error) {
        console.error("Error getting similar events:", error);
        return [];
    }
}
