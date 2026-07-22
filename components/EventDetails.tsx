import BookEvent from "@/components/BookEvent";
import EventCard from "@/components/EventCard";
import { EventResponse } from "@/database/event.model";
import { getSimilarEventsBySlug, getEventBySlug} from "@/lib/services/event.service";
import { getBookingCount } from "@/lib/services/booking.service";
import Image from "next/image";
import { notFound } from "next/navigation";



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


const EventDetails = async ({params} : { params : Promise<string> }) => {


    const slug = await params;

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

  const  { description, image, overview, date, time, location, mode, agenda, audience, tags, organizer} = event;

  const [similarEvents, booking]: [EventResponse[], number] = await Promise.all([
    getSimilarEventsBySlug(slug),
    getBookingCount(event._id),
  ]);


  return (
   <section id='event'>
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
          {booking > 0 ? (
            <p className="text-sm">
              Join {booking} people who have already book their Spot !
            </p>
          ): (
            <p className="text-sm">Be the first to book your Spot!</p>
          ) }

          <BookEvent slug={event.slug} eventId={event._id} />
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

export default EventDetails