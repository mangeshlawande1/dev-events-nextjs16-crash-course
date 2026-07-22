import type { MetadataRoute } from "next";
import connectToDatabase from "@/lib/mongodb";
import Event from "@/database/event.model";

import { clientEnv } from "@/lib/env";

const siteUrl = clientEnv.NEXT_PUBLIC_SITE_URL;

// Crawlers hit /sitemap.xml frequently; regenerating it from the DB on
// every single request is wasteful for content that doesn't need to be
// real-time. An hour-old sitemap is completely fine.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectToDatabase();

  const events = await Event.find({ status: "published" })
    .select("slug updatedAt")
    .lean();

  const eventEntries: MetadataRoute.Sitemap = events
    .filter((event) => event.slug)
    .map((event) => ({
      url: `${siteUrl}/events/${event.slug}`,
      lastModified: event.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/about`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...eventEntries,
  ];
}
