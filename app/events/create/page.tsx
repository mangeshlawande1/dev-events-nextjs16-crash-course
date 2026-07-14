import EventForm from "@/components/forms/EventForm";

export default function CreateEventPage() {
  return (
    <section className="wrapper py-10">
      <div className="mx-auto max-w-4xl space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Create a New Event
        </h1>

        <p className="text-muted-foreground">
          Fill in the details below to publish your developer conference,
          meetup, hackathon or workshop.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-4xl">
        <EventForm />
      </div>
    </section>
  );
}