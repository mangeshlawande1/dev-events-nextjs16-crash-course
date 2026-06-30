'use server'; // server action file
import { Booking } from "@/database";
import connectToDatabase from "../mongodb";



export const createBooking = async ({eventId, slug, email }: {eventId:string; slug:string; email:string}) =>{
    try {
        await connectToDatabase();
        await Booking.create({eventId, email, slug })
        //lean - convert mongdb doc as plain js object 

        return {success: true };

    } catch (error) {
        console.error('create booking failed',error)
        return {success:false };
    }
}