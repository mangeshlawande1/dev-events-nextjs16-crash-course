import { log } from "console";
import Image from "next/image";
import { notFound } from "next/navigation";


const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

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
        <div className="pill" key={tag} >{tag}</div>
      ))}
    
  </div>
);

const EventDetailsPage = async ({params} : { params : Promise<{slug : string }> }) => {
    const {slug} = await params ;
    let event; 
    try {
        const request = await fetch(`${BASE_URL}/api/events/${encodeURIComponent(slug)}`, {next:{revalidate:60 }});
        if(!request.ok){
          if(request.status=== 404){
            return notFound();
          }
          throw new Error(`Failed to Fetch Event ${request.statusText}`);
        };

      const response = await request.json();
      event = response.event;

      if(!event){
        return notFound();
      }
      
    } catch (error) {
        console.error("Error Fetching Event ",error)
   }

    const  { description, image, overview, date, time, location, mode, agenda, audience, tags, organizer} = event;

  return (
   <section id='event'>
    <h1> Event Details :<br /> {slug}</h1>
    <p >{description}</p>
    <div className="details">
      {/* Left side event content   */}
      <div className="content">
        <Image src={image} alt='Event Banner' width={800} height={800} className='banner' />
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
      <p className="text-lg font-semibold ">Book Event</p>
      </aside>
    </div>
   </section>
  )
}

export default EventDetailsPage;
