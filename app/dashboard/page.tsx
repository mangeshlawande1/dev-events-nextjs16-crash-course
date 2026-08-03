import Link from "next/link";
import { redirect } from "next/navigation";
import EventsTable from "@/components/dashboard/EventsTable";
import Pagination from "@/components/Pagination";
import { getAllEventsForDashboard } from "@/lib/services/event.service";
import { auth } from "@/lib/auth";

interface DashboardPageProps {
  searchParams: Promise<{ page?: string }>;
}

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
  const session = await auth();

  // proxy.ts already redirects unauthenticated/wrong-role visitors away from
  // /dashboard - this is a defense-in-depth check, not the primary gate.
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const isAdmin = session.user.role === "admin";

  const { page } = await searchParams;
  const requestedPage = Math.max(1, Number(page) || 1);

  const { events, totalPages, currentPage } = await getAllEventsForDashboard(
    requestedPage,
    { userId: session.user.id, role: session.user.role }
  );

  return (
    <section>
      <h1 className="text-center">Dashboard</h1>
      <p className="mt-5 text-center text-gray-400">
        {isAdmin
          ? "Manage every event on Dev Event."
          : "Manage your events."}
      </p>

      <div className="mt-4 text-center">
        <Link href="/dashboard/analytics" className="text-sm text-primary underline">
          View Analytics
        </Link>
      </div>

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
