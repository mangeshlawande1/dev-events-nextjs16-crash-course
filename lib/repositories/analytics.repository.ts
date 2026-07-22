import { Event, Booking } from "@/database";
import { connection } from "next/server";

import connectToDatabase from "../mongodb";

export interface PopularEvent {
  _id: string;
  title: string;
  slug: string;
  bookingCount: number;
}

export interface RecentRegistration {
  _id: string;
  email: string;
  createdAt: string;
  event: { title: string; slug: string } | null;
}

export interface CategoryCount {
  tag: string;
  count: number;
}

export interface AnalyticsSummary {
  totalEvents: number;
  publishedCount: number;
  draftCount: number;
  totalBookings: number;
  popularEvents: PopularEvent[];
  recentRegistrations: RecentRegistration[];
  categoryDistribution: CategoryCount[];
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  await connection();
  await connectToDatabase();

  const [
    totalEvents,
    publishedCount,
    draftCount,
    totalBookings,
    popularEventsRaw,
    recentRegistrationsRaw,
    categoryDistributionRaw,
  ] = await Promise.all([
    Event.countDocuments(),
    Event.countDocuments({ status: "published" }),
    Event.countDocuments({ status: "draft" }),
    Booking.countDocuments(),

    // Popular events - all-time booking count, regardless of status
    // (this is an internal/organizer view, unlike the public sort=popular).
    Event.aggregate([
      {
        $lookup: {
          from: "bookings",
          localField: "_id",
          foreignField: "eventId",
          as: "bookings",
        },
      },
      { $addFields: { bookingCount: { $size: "$bookings" } } },
      { $match: { bookingCount: { $gt: 0 } } },
      { $project: { title: 1, slug: 1, bookingCount: 1 } },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 },
    ]),

    Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("eventId", "title slug")
      .lean(),

    Event.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
  ]);

  const recentRegistrations: RecentRegistration[] = JSON.parse(
    JSON.stringify(recentRegistrationsRaw)
  ).map((booking: { _id: string; email: string; createdAt: string; eventId: { title: string; slug: string } | null }) => ({
    _id: booking._id,
    email: booking.email,
    createdAt: booking.createdAt,
    event: booking.eventId,
  }));

  const categoryDistribution: CategoryCount[] = JSON.parse(
    JSON.stringify(categoryDistributionRaw)
  ).map((entry: { _id: string; count: number }) => ({
    tag: entry._id,
    count: entry.count,
  }));

  return {
    totalEvents,
    publishedCount,
    draftCount,
    totalBookings,
    popularEvents: JSON.parse(JSON.stringify(popularEventsRaw)),
    recentRegistrations,
    categoryDistribution,
  };
}
