import EventCardSkeleton from "@/components/skeletons/EventCardSkeleton";
import { EVENTS_PAGE_SIZE } from "@/lib/repositories/event.repository";

const HomeLoading = () => {
  return (
    <section>
      <h1 className="text-center ">
        The Hub for Every Dev <br /> Event You Can&apos;t Miss{" "}
      </h1>
      <p className="mt-5 text-center">
        {" "}
        Hackathons, Meetups and Conferences, All in One Place !{" "}
      </p>

      <div id="events" className="mt-20 space-y-7 scroll-mt-10">
        <h3>Featured Events </h3>

        <div className="flex flex-col gap-4 animate-pulse" aria-hidden="true">
          <div className="mx-auto h-12 w-full max-w-xl rounded-lg bg-dark-200" />
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="h-9 w-32 rounded-lg bg-dark-200" />
            <div className="h-9 w-28 rounded-lg bg-dark-200" />
            <div className="h-9 w-28 rounded-lg bg-dark-200" />
            <div className="h-9 w-32 rounded-lg bg-dark-200" />
          </div>
        </div>

        <ul className="events">
          {Array.from({ length: EVENTS_PAGE_SIZE }).map((_, index) => (
            <li key={index} className="list-none">
              <EventCardSkeleton />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default HomeLoading;
