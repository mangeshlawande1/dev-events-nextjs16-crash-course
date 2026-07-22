import type { Metadata } from "next";
import BookEvent from "@/components/BookEvent";
import EventCard from "@/components/EventCard";
import { EventResponse } from "@/database/event.model";
import { getSimilarEventsBySlug, getEventBySlug} from "@/lib/services/event.service";
import { getBookingCount } from "@/lib/services/booking.service";
import { getEventDateTime, isRegistrationClosed } from "@/lib/utils";
import { clientEnv } from "@/lib/env";
import Image from "next/image";
import { notFound } from "next/navigation";

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event: EventResponse | null = await getEventBySlug(slug);

  if (!event) {
    return { title: "Event Not Found" };
  }

  const title = event.title;
  const description = event.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: [{ url: event.image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [event.image],
    },
  };
}


const EventDetailItem = ({alt, label, icon}:{alt:string; label:string; icon:string}) => (
  <div className="flex-row-gap-2 item-center">
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
);

const EventAgenda = ({agendaItems }: {agendaItems: string[] }) => (

  <div className="agenda">
    <h2>Agenda</h2>
    <ul>
      {agendaItems.map((item) => (
        <li key={item} > {item} </li>
      ))}      
    </ul>
  </div>
);

const EventTags = ({tags}: {tags: string[] }) => (
  <div className="flex flex-row gap-1.5 flex-wrap">
      {tags.map((tag)=>(
        <div className="pill" key={tag}> {tag}</div>
      ))}
    
  </div>
);

const EventDetailsPage = async ({params} : EventDetailPageProps) => {

  const {slug} = await params;
  let event; 
  
    try {
        event = await getEventBySlug(slug);

      if(!event){
        return notFound();
      }
      
    } catch (error) {
        console.error("Error Fetching Event ", error);
        throw error instanceof Error ? error : new Error("Failed to fetch event");   
    }

  const  { description, image, overview, date, time, location, mode, agenda, audience, tags, organizer, capacity} = event;

  const [similarEvents, booking]: [EventResponse[], number] = await Promise.all([
    getSimilarEventsBySlug(slug),
    getBookingCount(event._id),
  ]);

  const remainingSeats = Math.max(0, capacity - booking);
  const isFull = remainingSeats === 0;

  const eventIsClosed = isRegistrationClosed(date, time);

  const attendanceModeMap: Record<string, string> = {
    online: "https://schema.org/OnlineEventAttendanceMode",
    offline: "https://schema.org/OfflineEventAttendanceMode",
    hybrid: "https://schema.org/MixedEventAttendanceMode",
  };

  const startDateTime = getEventDateTime(date, time);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description,
    image: [image],
    startDate: startDateTime?.toISOString(),
    eventAttendanceMode: attendanceModeMap[mode],
    eventStatus: "https://schema.org/EventScheduled",
    location:
      mode === "online"
        ? { "@type": "VirtualLocation", url: clientEnv.NEXT_PUBLIC_SITE_URL }
        : { "@type": "Place", name: location, address: location },
    organizer: { "@type": "Organization", name: organizer },
  };


  return (
   <section id='event'>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
    <h1> Event Details :<br /> {slug}</h1>
    <p >{description}</p>
    <div className="details">
      {/* Left side event content   */}
      <div className="content">
        <Image src={image} alt='Event Banner' width={800} height={800} style={{ width: 'auto', height: 'auto' }} />
        <section className="flex-col-gap-2">  
          <h2>Overview </h2>
          <p>{overview}</p>
        </section>

        <section className="flex-col-gap-2">
          <h2>Event Details</h2>

          < EventDetailItem icon='/icons/calendar.svg' alt="calendar" label={date}/>
          < EventDetailItem icon='/icons/clock.svg' alt="clock" label={time}/>
          < EventDetailItem icon='/icons/pin.svg' alt="pin" label={location}/>
          < EventDetailItem icon='/icons/mode.svg' alt="mode" label={mode}/>
          < EventDetailItem icon='/icons/audience.svg' alt="audience" label={audience}/>
        </section>

        <EventAgenda agendaItems={agenda}/>

        <section className="flex-col-gap-2">
          <h2>About the Organizer</h2>
          <p> {organizer}</p>

        </section>
      <EventTags tags={tags}/>
      </div>
      {/* Right side- Booking Form   */}
     
      <aside className="booking">
      <p className="text-lg font-semibold">Book Event</p>

       <div className="signup-card">
          <h2>Book Your Spot</h2>
          {eventIsClosed ? (
            <p className="text-sm text-gray-400">
              Registration for this event has closed.
            </p>
          ) : isFull ? (
            <p className="text-sm text-red-400">
              This event is fully booked.
            </p>
          ) : booking > 0 ? (
            <p className="text-sm">
              Join {booking} people who have already booked their spot!{" "}
              {remainingSeats} seat{remainingSeats === 1 ? "" : "s"} left.
            </p>
          ) : (
            <p className="text-sm">
              Be the first to book your spot! {remainingSeats} seat
              {remainingSeats === 1 ? "" : "s"} available.
            </p>
          )}

          <BookEvent
            slug={event.slug}
            eventId={event._id}
            isFull={isFull}
            isClosed={eventIsClosed}
          />
        </div>


      </aside>
    </div>
    <div className="flex w-full flex-col gap-4 pt-20">
      <h2>Similar Events</h2>
      <div className="events">
        {similarEvents.length > 0 && similarEvents.map((event: EventResponse) =>
                event.slug ? (
                  <li key={event._id} className='list-none'>
                    <EventCard {...event} slug={event.slug} />
                  </li>
                ) : null
              )}
      </div>
    </div>
   </section>
  )
}

export default EventDetailsPage;
