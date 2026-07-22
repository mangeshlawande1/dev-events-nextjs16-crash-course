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
