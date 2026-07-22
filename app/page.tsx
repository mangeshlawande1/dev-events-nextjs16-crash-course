import ExploreBtn from "@/components/ExploreBtn";
import EventsGrid from "@/components/EventsGrid";
import Pagination from "@/components/Pagination";
import { getAllEvents } from "@/lib/services/event.service";

interface HomePageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

const Page = async ({ searchParams }: HomePageProps) => {
  const params = await searchParams;
  const page = Number(params.page ?? "1");

  const {
    events,
    currentPage,
    totalPages,
  } = await getAllEvents(Number.isNaN(page) || page < 1 ? 1 : page);

  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev <br /> Event You Can&apos;t Miss
      </h1>

      <p className="mt-5 text-center">
        Hackathons, Meetups and Conferences, All in One Place!
      </p>

      <div className="mt-7 flex flex-col items-center gap-5 text-center">
        <ExploreBtn />
      </div>

      <div id="events" className="mt-20 space-y-7 scroll-mt-10">
        <h3>Featured Events</h3>

        <EventsGrid events={events} />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </div>
    </section>
  );
};

export default Page;