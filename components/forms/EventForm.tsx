"use client";

import Image from "next/image";
import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  eventFormSchema,
  eventEditFormSchema,
  EventFormValues,
  EventEditFormValues,
} from "@/lib/validations/event";





type EventFormMode = "create" | "edit";

interface EventFormProps {
  mode?: EventFormMode;
  /** Required when mode="edit" - the event's current slug (used for the PATCH URL). */
  eventSlug?: string;
  /** Prefills the form when mode="edit". image is the existing Cloudinary URL, not a File. */
  initialData?: Partial<Omit<EventFormValues, "image">> & { image?: string };
}

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="mt-1 text-sm text-red-400">{message}</p>
  ) : null;

const EventForm = ({
  mode = "create",
  eventSlug,
  initialData,
}: EventFormProps) => {
  const isEditMode = mode === "edit";

  const {
  register,
  handleSubmit,
  setValue,
  formState: { errors },
} = useForm<EventFormValues | EventEditFormValues>({
  resolver: zodResolver(isEditMode ? eventEditFormSchema : eventFormSchema),

  defaultValues: {
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    overview: initialData?.overview ?? "",
    venue: initialData?.venue ?? "",
    location: initialData?.location ?? "",
    date: initialData?.date ?? "",
    time: initialData?.time ?? "",
    mode: initialData?.mode ?? "offline",
    audience: initialData?.audience ?? "",
    capacity: initialData?.capacity ?? 50,
    organizer: initialData?.organizer ?? "",
    agenda: initialData?.agenda ?? [],
    tags: initialData?.tags ?? [],
    status: initialData?.status ?? "published",
  },
});

  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(
    typeof initialData?.image === "string" ? initialData.image : ""
  );
  const [submitError, setSubmitError] = useState("");


const onSubmit = async (values: EventFormValues | EventEditFormValues) => {
  setLoading(true);
  setSubmitError("");

  try {
    const formData = new FormData();

    Object.entries(values).forEach(([key, value]) => {
      if (key === "agenda" || key === "tags") {
        formData.append(key, JSON.stringify(value));
      } else if (key === "image") {
        // Only append when a new file was actually picked - editing
        // without touching the banner should keep the existing image.
        if (value instanceof File) {
          formData.append("image", value);
        }
      } else {
        formData.append(key, String(value));
      }
    });

    const response = await fetch(
      isEditMode ? `/api/events/${eventSlug}` : "/api/events",
      {
        method: isEditMode ? "PATCH" : "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    if (data.event.status === "draft") {
      router.push("/dashboard");
    } else {
      router.push(`/events/${data.event.slug}`);
    }
  } catch (error) {
    console.error(error);
    setSubmitError(
      error instanceof Error
        ? error.message
        : `Failed to ${isEditMode ? "update" : "create"} event.`
    );
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
        <h1>{isEditMode ? "Edit Event" : "Create Event"}</h1>

        <p className="subheading">
          {isEditMode
            ? "Update your event's details below."
            : "Publish your meetup, hackathon or developer conference."}
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
            <FieldError message={errors.title?.message} />
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
            <FieldError message={errors.description?.message} />
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
            <FieldError message={errors.overview?.message} />
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
            <FieldError message={errors.venue?.message} />
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
            <FieldError message={errors.location?.message} />
          </div>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Event Mode
          </label>

          <select className="w-full rounded-lg border border-dark-200 bg-dark-200 px-4 py-3 outline-none transition focus:border-primary" {...register("mode")}>
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
            <FieldError message={errors.date?.message} />
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
            <FieldError message={errors.time?.message} />
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
            <FieldError message={errors.audience?.message} />
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
            <FieldError message={errors.organizer?.message} />
          </div>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Capacity
          </label>

          <input
            type="number"
            min={1}
            placeholder="100"
            {...register("capacity", { valueAsNumber: true })}
            className="w-full rounded-lg border border-dark-200 bg-dark-200 px-4 py-3 outline-none transition focus:border-primary"
            required
          />
          <FieldError message={errors.capacity?.message} />
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
        <FieldError message={errors.agenda?.message} />
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
        <FieldError message={errors.tags?.message} />
      </section>
            {/* ================= Banner Image ================= */}

      <section className="glass card-shadow space-y-6 rounded-xl border border-border-dark p-8">
        <div>
          <h3>🖼 Event Banner</h3>

          <p className="mt-1 text-light-200">
            {isEditMode
              ? "Upload a new banner to replace the current one, or leave it as-is."
              : "Upload a banner image for your event."}
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

    setValue("image", file, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    setPreview(URL.createObjectURL(file));
      }}
          />
        <FieldError message={errors.image?.message as string | undefined} />
      </section>

      {/* ================= Submit ================= */}

      <div className="sticky bottom-0 rounded-xl border border-border-dark bg-dark-200bg-primary p-5 backdrop-blur-md">
        <div className="mb-4 flex items-center justify-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              value="draft"
              {...register("status")}
            />
            Save as Draft
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              value="published"
              {...register("status")}
            />
            Publish
          </label>
        </div>

        <FieldError message={submitError} />
        <button
          type="submit"
          disabled={loading}
          id="explore-btn" className="mx-auto items-center rounded-lg bg-primary/80 px-6 py-3 text-lg font-medium text-black transition hover:bg-primary/70 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? isEditMode
              ? "Saving..."
              : "Creating..."
            : isEditMode
            ? "Save Changes"
            : "Create Event"}
        </button>
      </div>
    </form> 
  );
};

export default EventForm;