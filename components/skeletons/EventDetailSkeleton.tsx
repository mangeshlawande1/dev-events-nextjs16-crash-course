import EventCardSkeleton from "@/components/skeletons/EventCardSkeleton";

const line = "animate-pulse rounded bg-dark-200";

const EventDetailSkeleton = () => {
  return (
    <section id="event" aria-hidden="true">
      <div className={`${line} mx-auto h-8 w-2/3`} />
      <div className={`${line} mx-auto mt-4 h-4 w-1/2`} />

      <div className="details">
        {/* Left side - mirrors event content */}
        <div className="content">
          <div className={`${line} h-[400px] w-full`} />

          <section className="flex-col-gap-2">
            <div className={`${line} h-6 w-32`} />
            <div className={`${line} mt-2 h-4 w-full`} />
            <div className={`${line} mt-2 h-4 w-5/6`} />
          </section>

          <section className="flex-col-gap-2">
            <div className={`${line} h-6 w-40`} />
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex-row-gap-2 item-center mt-2">
                <div className={`${line} h-[17px] w-[17px] rounded-full`} />
                <div className={`${line} h-4 w-28`} />
              </div>
            ))}
          </section>

          <section className="flex-col-gap-2">
            <div className={`${line} h-6 w-24`} />
            <div className={`${line} mt-2 h-4 w-3/4`} />
            <div className={`${line} mt-2 h-4 w-2/3`} />
          </section>

          <div className="flex flex-row flex-wrap gap-1.5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className={`${line} h-6 w-16 rounded-full`} />
            ))}
          </div>
        </div>

        {/* Right side - booking card */}
        <aside className="booking">
          <div className={`${line} h-5 w-28`} />
          <div className="signup-card">
            <div className={`${line} h-6 w-36`} />
            <div className={`${line} mt-2 h-4 w-48`} />
            <div className={`${line} mt-4 h-11 w-full rounded-lg`} />
          </div>
        </aside>
      </div>

      <div className="flex w-full flex-col gap-4 pt-20">
        <div className={`${line} h-6 w-40`} />
        <div className="events">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="list-none">
              <EventCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventDetailSkeleton;
