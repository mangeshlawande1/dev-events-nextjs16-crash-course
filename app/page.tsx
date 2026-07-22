import ExploreBtn from '@/components/ExploreBtn';
import EventCard from '@/components/EventCard';
import EventsGrid from '@/components/EventsGrid';
import EventsFilterBar from '@/components/EventsFilterBar';
import Pagination from '@/components/Pagination';
import { getAllEvents, getEventFilterOptions, getTrendingEvents } from '@/lib/services/event.service';
import type { EventSortOption } from '@/lib/repositories/event.repository';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Dev Event - Browse Developer Conferences, Hackathons & Meetups",
  description:
    "Discover and book developer events - conferences, hackathons, and meetups, all in one place.",
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
    location?: string;
    mode?: string;
    tag?: string;
    sort?: string;
  }>;
}

const VALID_SORTS: EventSortOption[] = ["latest", "upcoming", "popular"];

const Page = async({ searchParams }: PageProps) => {
    const { page, q, location, mode, tag, sort } = await searchParams;
    const requestedPage = Math.max(1, Number(page) || 1);

    const sortOption = VALID_SORTS.includes(sort as EventSortOption)
      ? (sort as EventSortOption)
      : undefined;

    const isDefaultView = !q && !location && !mode && !tag;

    const [{ events, totalPages, currentPage }, filterOptions, trendingEvents] =
      await Promise.all([
        getAllEvents(requestedPage, {
          query: q,
          location,
          mode: mode as "online" | "offline" | "hybrid" | undefined,
          tag,
          sort: sortOption,
        }),
        getEventFilterOptions(),
        isDefaultView ? getTrendingEvents() : Promise.resolve([]),
      ]);

  return (
    <section>
        <h1 className='text-center '>The Hub for Every Dev <br /> Event You Can&apos;t Miss </h1>
        <p className='text-center mt-5'> Hackathons, Meetups and Conferences, All in One Place ! </p>

        <div className="mt-7 item-center flex flex-col gap-5 text-center">
          <ExploreBtn />
        </div>

        {trendingEvents.length > 0 && (
          <div className="mt-20 space-y-7">
            <h3>🔥 Trending Events</h3>
            <ul className="events">
              {trendingEvents.map((event) =>
                event.slug ? (
                  <li key={event._id} className="list-none">
                    <EventCard {...event} slug={event.slug} />
                  </li>
                ) : null
              )}
            </ul>
          </div>
        )}

        {/* ADDED id="events" here so the button points to this section */}
        <div id="events" className="mt-20 space-y-7 scroll-mt-10">
          <h3>Featured Events </h3>

          <EventsFilterBar filterOptions={filterOptions} />

          <EventsGrid events={events} />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            extraParams={{ q, location, mode, tag, sort: sortOption }}
          />
        </div>
    </section>
  )
}

export default Page;
