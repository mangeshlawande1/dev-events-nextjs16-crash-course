import type { Metadata } from "next";
import Link from "next/link";
import { getAnalyticsSummary } from "@/lib/services/analytics.service";

export const metadata: Metadata = {
  title: "Analytics | Dev Event",
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-xl border border-dark-200 bg-dark-100/60 p-6">
    <p className="text-sm text-gray-400">{label}</p>
    <p className="mt-2 text-3xl font-semibold">{value}</p>
  </div>
);

const AnalyticsPage = async () => {
  const {
    totalEvents,
    publishedCount,
    draftCount,
    totalBookings,
    popularEvents,
    recentRegistrations,
    categoryDistribution,
  } = await getAnalyticsSummary();

  const maxCategoryCount = Math.max(
    1,
    ...categoryDistribution.map((c) => c.count)
  );

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-center">Analytics</h1>
      <p className="mt-5 text-center text-gray-400">
        A snapshot of activity across every event.
      </p>

      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Events" value={totalEvents} />
        <StatCard label="Published" value={publishedCount} />
        <StatCard label="Drafts" value={draftCount} />
        <StatCard label="Total Bookings" value={totalBookings} />
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <div>
          <h3>Popular Events</h3>
          {popularEvents.length === 0 ? (
            <p className="mt-4 text-sm text-gray-400">
              No bookings yet - popular events will show up here once people
              start booking.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {popularEvents.map((event) => (
                <li
                  key={event._id}
                  className="flex items-center justify-between rounded-lg border border-dark-200 px-4 py-3"
                >
                  <Link
                    href={`/events/${event.slug}`}
                    className="line-clamp-1 text-sm font-medium hover:text-primary"
                  >
                    {event.title}
                  </Link>
                  <span className="text-sm text-gray-400">
                    {event.bookingCount} booking
                    {event.bookingCount === 1 ? "" : "s"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3>Category Distribution</h3>
          {categoryDistribution.length === 0 ? (
            <p className="mt-4 text-sm text-gray-400">No tags yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {categoryDistribution.map((category) => (
                <li key={category.tag}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{category.tag}</span>
                    <span className="text-gray-400">{category.count}</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-dark-200">
                    <div
                      className="h-2 rounded-full bg-primary/80"
                      style={{
                        width: `${(category.count / maxCategoryCount) * 100}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-16">
        <h3>Recent Registrations</h3>
        {recentRegistrations.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">No bookings yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-dark-200">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="border-b border-dark-200 bg-dark-100/60 text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Booked</th>
                </tr>
              </thead>
              <tbody>
                {recentRegistrations.map((registration) => (
                  <tr
                    key={registration._id}
                    className="border-b border-dark-200 last:border-0"
                  >
                    <td className="px-4 py-3">{registration.email}</td>
                    <td className="px-4 py-3">
                      {registration.event ? (
                        <Link
                          href={`/events/${registration.event.slug}`}
                          className="hover:text-primary"
                        >
                          {registration.event.title}
                        </Link>
                      ) : (
                        <span className="text-gray-500">(event deleted)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(registration.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default AnalyticsPage;
