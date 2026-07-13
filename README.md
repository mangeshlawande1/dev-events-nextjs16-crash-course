app/
│
├── events/
│     └── [slug]/
│           └── page.tsx
│
lib/
│
├── repositories/
│     event.repository.ts      // Raw MongoDB queries
│
├── services/
│     event.service.ts         // "use cache", cacheLife(), cacheTag()
│
└── actions/
      booking.actions.ts       // "use server"


Repositories know how to talk to MongoDB.
Services decide what should be cached and for how long.
Pages just render the data.

This separation scales well as your application grows.