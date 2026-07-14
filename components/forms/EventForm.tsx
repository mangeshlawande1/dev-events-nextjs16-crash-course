"use client";

import Image from "next/image";
import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  eventFormSchema,
  EventFormValues,
} from "@/lib/validations/event";





const EventForm = () => {
  const {
  register,
  handleSubmit,
  setValue,
  watch,
  formState: { errors },
} = useForm<EventFormValues>({
  resolver: zodResolver(eventFormSchema),

  defaultValues: {
    title: "",
    description: "",
    overview: "",
    venue: "",
    location: "",
    date: "",
    time: "",
    mode: "offline",
    audience: "",
    organizer: "",
    agenda: [],
    tags: [],
  },
});

  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");


const onSubmit = async (values: EventFormValues) => {
  setLoading(true);

  try {
    const formData = new FormData();

    Object.entries(values).forEach(([key, value]) => {
      if (key === "agenda" || key === "tags") {
        formData.append(key, JSON.stringify(value));
      } else if (key === "image") {
          formData.append("image", value as File);
      } else {
        formData.append(key, String(value));
      }
    });

    const response = await fetch("/api/events", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    router.push(`/events/${data.event.slug}`);
  } catch (error) {
    console.error(error);
    alert("Failed to create event.");
  } finally {
    setLoading(false);
  }
};

    return (
    <form 
    onSubmit={handleSubmit(onSubmit)}
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
              className="w-full rounded-lg border border-dark-200 bg-dark-200 px-4 py-3 outline-none transition focus:border-primary"
              {...register("title")}
              placeholder="React India Summit 2026"
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
              {...register("description")}
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
              {...register("overview")}
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
              {...register("venue")}
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
              {...register("location")}
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Event Mode
          </label>

          <select {...register("mode")}>
            <option value="offline">Offline</option>
            <option value="online">Online</option>
            <option value="hybrid">Hybrid</option>
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
              {...register("date" )}
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
              {...register("time")}
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
              {...register("audience")}
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
              {...register("organizer")}
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
        </div>

        <textarea
              rows={5}
              placeholder="Enter one agenda item per line..."
              className="w-full resize-none rounded-lg border border-dark-200 bg-dark-200 px-4 py-3 outline-none transition focus:border-primary"            onChange={(e) =>
              setValue(
                "agenda",
                e.target.value
                  .split("\n")
                  .map((i) => i.trim())
                  .filter(Boolean)
              )
            }
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
          onChange={(e) =>
            setValue(
              "tags",
              e.target.value
                .split(",")
                .map((i) => i.trim())
                .filter(Boolean)
            )
          }
          className=" block w-full rounded-lg border border-dark-200 bg-dark-200 p-2 outline-none transition focus:border-primary"

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
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-dark-200 bg-dark-200 p-10 text-center transition hover:border-primary"
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
            hidden
            type="file"
            accept="image/*"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
            
              if (!file) return;
            
               console.log(file);

    setValue("image", file, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    setPreview(URL.createObjectURL(file));
      }}
          />
      </section>

      {/* ================= Submit ================= */}

      <div className="sticky bottom-0 rounded-xl border border-border-dark bg-dark-200bg-primary p-5 backdrop-blur-md">
        <button
          type="submit"
          disabled={loading}
          id="explore-btn" className="mx-auto items-center rounded-lg bg-primary px-6 py-3 text-lg font-medium text-dark-100 transition hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
      </div>
    </form> 
  );
};

export default EventForm;