import {NextRequest, NextResponse} from "next/server";
import { v2 as cloudinary } from 'cloudinary';

import connectDB from "@/lib/mongodb";
import Event from '@/database/event.model';

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const formData = await req.formData();

        let event;

        try {
            event = Object.fromEntries(formData.entries());
        } catch (e) {
            return NextResponse.json({ message: 'Invalid JSON data format'}, { status: 400 })
        }

        const file = formData.get('image');
        const tagsRaw = formData.get('tags');
        const agendaRaw = formData.get('agenda');

        if (!(file instanceof File) || file.size === 0) {
            return NextResponse.json({ message: 'Image file is required'}, { status: 400 });
        }

        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ message: 'Image must be an image file'}, { status: 400 });
        }

        const maxImageSize = 5 * 1024 * 1024;
        if (file.size > maxImageSize) {
            return NextResponse.json({ message: 'Image file is too large'}, { status: 400 });
        }

        if (typeof tagsRaw !== 'string' || typeof agendaRaw !== 'string') {
            return NextResponse.json({ message: 'Tags and agenda are required'}, { status: 400 });
        }

        let tags;
        let agenda;
        try {
            tags = JSON.parse(tagsRaw);
            agenda = JSON.parse(agendaRaw);
        } catch {
            return NextResponse.json({ message: 'Invalid tags or agenda format'}, { status: 400 });
        }

        if (!Array.isArray(tags) || !Array.isArray(agenda)) {
            return NextResponse.json({ message: 'Tags and agenda must be arrays'}, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'DevEvent' }, (error, results) => {
                if(error) return reject(error);

                resolve(results);
            }).end(buffer);
        });

        event.image = (uploadResult as { secure_url: string }).secure_url;

        const createdEvent = await Event.create({
            ...event,
            tags: tags,
            agenda: agenda,
        });

        return NextResponse.json({ message: 'Event created successfully', event: createdEvent }, { status: 201 });
    } catch (e) {
         console.error('Event creation failed:', e);
         return NextResponse.json({ message: 'Event Creation Failed' }, { status: 500 })
    }
};

export async function GET() {
    try {
        await connectDB();

        const events = await Event.find().sort({ createdAt: -1 });

        return NextResponse.json({ message: 'Events fetched successfully', events }, { status: 200 });
    } catch (e) {
        console.error('Event fetching failed:', e);
        return NextResponse.json({ message: 'Event fetching failed' }, { status: 500 });    }
};
