import Link from "next/link";
import EventsTable from "@/components/dashboard/EventsTable";
import Pagination from "@/components/Pagination";
import { getAllEventsForDashboard } from "@/lib/services/event.service";

interface DashboardPageProps {
  searchParams: Promise<{ page?: string }>;
}

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
  const { page } = await searchParams;
  const requestedPage = Math.max(1, Number(page) || 1);

  const { events, totalPages, currentPage } = await getAllEventsForDashboard(
    requestedPage
  );

  return (
    <section>
      <h1 className="text-center">Dashboard</h1>
      <p className="mt-5 text-center text-gray-400">
        Manage every event on Dev Event.
      </p>

      <div className="mt-4 text-center">
        <Link href="/dashboard/analytics" className="text-sm text-primary underline">
          View Analytics
        </Link>
      </div>

      {/*
        Known gap: this lists ALL events, not just "your" events, since
        there's no auth/organizer ownership yet. Once auth lands, this
        gets a createdBy filter.
      */}

      <div className="mt-16 space-y-7">
        <EventsTable events={events} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath="/dashboard"
        />
      </div>
    </section>
  );
};

export default DashboardPage;
