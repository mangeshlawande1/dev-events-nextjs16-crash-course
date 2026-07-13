'use client';
import { createBooking } from "@/lib/actions/booking.actions";
import { useState } from "react"
import posthog from "posthog-js";

/// props structure layout interface 
interface BookEventProps {
    eventId : string;
    slug: string;
}

const BookEvent = ({eventId, slug}:BookEventProps ) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit =async (e: React.FormEvent) => {
        e.preventDefault();// prevent default behaviour of the browser to reload 
        if(!email.trim()) return;
        const {success} =  await createBooking({eventId, slug, email });
        if(success){
            setSubmitted(true);
            posthog.capture('event_booked', {eventId, slug, email })
        }else{
            console.error("Booking creation Failed !" )
            posthog.captureException("Booking creation Failed !")
        }
       
        setTimeout(()=> { 
            setSubmitted(true)
        }, 1000)
    }
  return (
    <div id="book-event">
        {submitted ? (
            <p className="text-sm">
                Thank you For signing up !
            </p>
        ) : (
           <form onSubmit={handleSubmit}>
            <div >
                <label htmlFor="email">Email Address</label>
                <input 
                type="email" 
                required 
                value={email}
                onChange={ (e) => setEmail(e.target.value)}
                id="email"
                placeholder="Enter Your email address" />
            </div>
            <button className="button-submit" type="submit"> Submit </button>
           </form>
        ) }
    </div>
  )
}

export default BookEvent