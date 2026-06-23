import EventCard from '@/components/EventCard';
import ExploreBtn from '@/components/ExploreBtn';
import { events } from '@/lib/constants';


// const events =  [
//   {  title:'Event 1',
//      image:'/images/event1.png',
//      slug:"event-1",
//      location:'location-1',
//      date: "Date-1",
//      time:"Time-1"

//    },
//   { 
//     title:'Event 2', 
//     image:'/images/event2.png',
//     slug:"event-2",
//     location:'location-2',
//     date: "Date-2",
//     time:"Time-2"
//    },
// ]

const page = () => {
  return (
    <section>
          <h1 className='text-center '>The Hub for Every Dev <br /> Event You Can't Miss   </h1>
          <p className='text-center mt-5'> Hackathons, Meetups and Conferences, All in One Place ! </p>

          <ExploreBtn/>

          <div className="mt-20 space-y-7">
            <h3>Featured Events </h3>

            <ul className='events'>
              {events.map((event)=>(
                <li key={event.title}>
                 <EventCard {...event}/>
                </li>
               ))}
            </ul>
          </div>
    </section>
  )
}

export default page;
