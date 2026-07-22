import EventCard from '@/components/EventCard';
import ExploreBtn from '@/components/ExploreBtn';
import { EventResponse } from '@/database/event.model';
import { getAllEvents } from '@/lib/services/event.service';

const Page = async() => {
    const events = await getAllEvents();
    const eventList = Array.isArray(events)
      ? events
      : (events as { events?: EventResponse[] }).events ?? [];


  return (
    <section>
        <h1 className='text-center '>The Hub for Every Dev <br /> Event You Can&apos;t Miss </h1>
        <p className='text-center mt-5'> Hackathons, Meetups and Conferences, All in One Place ! </p>

        <div className="mt-7 item-center flex flex-col gap-5 text-center">
          <ExploreBtn />
        </div>

        {/* ADDED id="events" here so the button points to this section */}
        <div id="events" className="mt-20 space-y-7 scroll-mt-10">
          <h3>Featured Events </h3>

          <ul className='events'>
            {eventList.map((event: EventResponse) =>
              event.slug ? (
                <li key={event._id} className='list-none'>
                  <EventCard {...event} slug={event.slug} />
                </li>
              ) : null
            )}
          </ul>
        </div>
    </section>
  )
}

export default Page;
