"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const EventForm = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  // Basic Information
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [overview, setOverview] = useState("");
  const [preview, setPreview] = useState("");
  
  // Event Details
  const [venue, setVenue] = useState("");
  const [location, setLocation] = useState("");
  const [mode, setMode] = useState("offline");

  // Schedule
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [audience, setAudience] = useState("");
  const [organizer, setOrganizer] = useState("");

  // One agenda item per line
  const [agenda, setAgenda] = useState("");

  // Comma separated tags
  const [tags, setTags] = useState("");

  // Banner Image
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!image) {
      alert("Please upload an event banner.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);
      formData.append("overview", overview);

      formData.append("venue", venue);
      formData.append("location", location);

      formData.append("date", date);
      formData.append("time", time);

      formData.append("mode", mode);
      formData.append("audience", audience);
      formData.append("organizer", organizer);

      formData.append("image", image);

      const agendaArray = agenda
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      const tagsArray = tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      formData.append(
        "agenda",
        JSON.stringify(agendaArray)
      );

      formData.append(
        "tags",
        JSON.stringify(tagsArray)
      );

      const response = await fetch("/api/events", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create event."
        );
      }

      alert("Event created successfully!");

      router.push(`/events/${data.event.slug}`);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

    return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-5xl flex-col gap-10"
    >
      <div className="space-y-3 text-center">
        <h1>Create Event</h1>

        <p className="subheading">
          Publish your meetup, hackathon or developer
          conference.
        </p>
      </div>
            {/* ================= Basic Information ================= */}

      <section className="glass card-shadow space-y-6 rounded-xl border border-border-dark p-8">
        <div>
          <h3>📝 Basic Information</h3>
          <p className="mt-1 text-light-200">
            Tell people what your event is about.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block font-medium">
              Event Title
            </label>

            <input
              type="text"
              placeholder="React India Summit 2026"
              className="w-full rounded-lg border border-dark-200 bg-dark-200 px-4 py-3 outline-none transition focus:border-primary"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Description
            </label>

            <textarea
              rows={4}
              placeholder="Short description about your event..."
              className="w-full resize-none rounded-lg border border-dark-200 bg-dark-200 px-4 py-3 outline-none transition focus:border-primary"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Overview
            </label>

            <textarea
              rows={6}
              placeholder="Write a detailed overview..."
              className="w-full resize-none rounded-lg border border-dark-200 bg-dark-200 px-4 py-3 outline-none transition focus:border-primary"
              value={overview}
              onChange={(e) =>
                setOverview(e.target.value)
              }
              required
            />
          </div>
        </div>
      </section>

      {/* ================= Event Details ================= */}

      <section className="glass card-shadow space-y-6 rounded-xl border border-border-dark p-8">
        <div>
          <h3>📍 Event Details</h3>

          <p className="mt-1 text-light-200">
            Where and how will your event take place?
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium">
              Venue
            </label>

            <input
              type="text"
              placeholder="Grand Hyatt Convention Center"
              className="w-full rounded-lg border border-dark-200 bg-dark-200 px-4 py-3 outline-none transition focus:border-primary"
              value={venue}
              onChange={(e) =>
                setVenue(e.target.value)
              }
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Location
            </label>

            <input
              type="text"
              placeholder="Goa, India"
              className="w-full rounded-lg border border-dark-200 bg-dark-200 px-4 py-3 outline-none transition focus:border-primary"
              value={location}
              onChange={(e) =>
                setLocation(e.target.value)
              }
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Event Mode
          </label>

          <select
            value={mode}
            onChange={(e) =>
              setMode(e.target.value)
            }
            className="w-full rounded-lg border border-dark-200 bg-dark-200 px-4 py-3 outline-none transition focus:border-primary"
          >
            <option value="offline">
              Offline
            </option>

            <option value="online">
              Online
            </option>

            <option value="hybrid">
              Hybrid
            </option>
          </select>
        </div>
      </section>
            {/* ================= Schedule ================= */}

      <section className="glass card-shadow space-y-6 rounded-xl border border-border-dark p-8">
        <div>
          <h3>📅 Schedule</h3>

          <p className="mt-1 text-light-200">
            Choose when your event will take place.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium">
              Event Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-dark-200 bg-dark-200 px-4 py-3 outline-none transition focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Event Time
            </label>

            <input
              type="text"
              placeholder="09:30 AM"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-lg border border-dark-200 bg-dark-200 px-4 py-3 outline-none transition focus:border-primary"
              required
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium">
              Target Audience
            </label>

            <input
              type="text"
              placeholder="Frontend Developers, Students"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full rounded-lg border border-dark-200 bg-dark-200 px-4 py-3 outline-none transition focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Organizer
            </label>

            <input
              type="text"
              placeholder="React India Community"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              className="w-full rounded-lg border border-dark-200 bg-dark-200 px-4 py-3 outline-none transition focus:border-primary"
              required
            />
          </div>
        </div>
      </section>

      {/* ================= Agenda ================= */}

      <section className="glass card-shadow space-y-6 rounded-xl border border-border-dark p-8">
        <div>
          <h3>📖 Agenda</h3>

          <p className="mt-1 text-light-200">
            Enter one agenda item per line.
          </p>
        </div>

        <textarea
          rows={8}
          placeholder={`Opening Keynote
React Server Components
Next.js Workshop
Networking Session`}
          value={agenda}
          onChange={(e) => setAgenda(e.target.value)}
          className="w-full resize-none rounded-lg border border-dark-200 bg-dark-200 px-4 py-3 outline-none transition focus:border-primary"
          required
        />
      </section>

      {/* ================= Tags ================= */}

      <section className="glass card-shadow space-y-6 rounded-xl border border-border-dark p-8">
        <div>
          <h3>🏷 Tags</h3>

          <p className="mt-1 text-light-200">
            Separate tags with commas.
          </p>
        </div>

        <input
          type="text"
          placeholder="react,nextjs,mongodb,typescript"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full rounded-lg border border-dark-200 bg-dark-200 px-4 py-3 outline-none transition focus:border-primary"
          required
        />
      </section>
            {/* ================= Banner Image ================= */}

      <section className="glass card-shadow space-y-6 rounded-xl border border-border-dark p-8">
        <div>
          <h3>🖼 Event Banner</h3>

          <p className="mt-1 text-light-200">
            Upload a banner image for your event.
          </p>
        </div>

        <label
          htmlFor="image"
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-dark-200 p-10 text-center transition hover:border-primary"
        >
          {preview ? (
            <Image
              src={preview}
              alt="Event Preview"
              width={900}
              height={500}
              className="max-h-80 w-full rounded-lg object-cover"
            />
          ) : (
            <>
              <p className="text-5xl">📷</p>

              <p className="mt-4 text-lg font-medium">
                Click to upload event banner
              </p>

              <p className="mt-2 text-sm text-light-200">
                PNG, JPG or WEBP (Max 5 MB)
              </p>
            </>
          )}
        </label>

        <input
          id="image"
          type="file"
          accept="image/*"
          hidden
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];

            if (!file) return;

            setImage(file);
            setPreview(URL.createObjectURL(file));
          }}
        />
      </section>

      {/* ================= Submit ================= */}

      <div className="sticky bottom-0 rounded-xl border border-border-dark bg-dark-100 p-5 backdrop-blur-md">
        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer rounded-lg bg-primary px-6 py-4 text-lg font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating Event..." : "🚀 Create Event"}
        </button>
      </div>
    </form>
  );
};

export default EventForm;