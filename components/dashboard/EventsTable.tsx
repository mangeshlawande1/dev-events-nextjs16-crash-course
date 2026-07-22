"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { EventResponse } from "@/database/event.model";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";

interface EventsTableProps {
  events: EventResponse[];
}

const EventsTable = ({ events: initialEvents }: EventsTableProps) => {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const toast = useToast();
  const [events, setEvents] = useState(initialEvents);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [duplicatingSlug, setDuplicatingSlug] = useState<string | null>(null);
  const [togglingSlug, setTogglingSlug] = useState<string | null>(null);

  const handleDelete = async (event: EventResponse) => {
    if (!event.slug) return;

    const confirmed = await confirm({
      title: `Delete "${event.title}"?`,
      description: "This also removes its bookings and cannot be undone.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!confirmed) return;

    setDeletingSlug(event.slug);

    try {
      const response = await fetch(`/api/events/${event.slug}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setEvents((prev) => prev.filter((e) => e.slug !== event.slug));
      toast.success(`"${event.title}" was deleted.`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete event."
      );
    } finally {
      setDeletingSlug(null);
    }
  };

  const handleDuplicate = async (event: EventResponse) => {
    if (!event.slug) return;

    setDuplicatingSlug(event.slug);

    try {
      const response = await fetch(`/api/events/${event.slug}/duplicate`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      toast.success("Event duplicated - now editing the copy.");
      router.push(`/dashboard/events/${data.event.slug}/edit`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to duplicate event."
      );
      setDuplicatingSlug(null);
    }
  };

  const handleToggleStatus = async (event: EventResponse) => {
    if (!event.slug) return;

    const nextStatus = event.status === "published" ? "draft" : "published";

    setTogglingSlug(event.slug);

    try {
      const response = await fetch(`/api/events/${event.slug}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setEvents((prev) =>
        prev.map((e) =>
          e.slug === event.slug ? { ...e, status: nextStatus } : e
        )
      );
      toast.success(
        nextStatus === "published" ? "Event published." : "Event unpublished."
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update status."
      );
    } finally {
      setTogglingSlug(null);
    }
  };

  if (events.length === 0) {
    return (
      <>
        {dialog}
        <p className="py-16 text-center text-gray-400">
          No events yet -{" "}
          <Link href="/events/create" className="text-primary underline">
            create your first one
          </Link>
          .
        </p>
      </>
    );
  }

  return (
    <div className="space-y-3">
      {dialog}

      <div className="overflow-x-auto rounded-xl border border-dark-200">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-dark-200 bg-dark-100/60 text-gray-400">
            <tr>
              <th className="px-4 py-3 font-medium">Event</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const isDeleting = deletingSlug === event.slug;
              const isDuplicating = duplicatingSlug === event.slug;
              const isToggling = togglingSlug === event.slug;
              const isPublished = event.status === "published";

              return (
                <tr
                  key={event._id}
                  className="border-b border-dark-200 last:border-0"
                >
                  <td className="flex items-center gap-3 px-4 py-3">
                    <Image
                      src={event.image}
                      alt={event.title}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-md object-cover"
                    />
                    <span className="line-clamp-1 font-medium">
                      {event.title}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        isPublished
                          ? "bg-green-900/30 text-green-400"
                          : "bg-yellow-900/30 text-yellow-400"
                      }`}
                    >
                      {isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{event.date}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {event.location}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(event)}
                        disabled={isToggling}
                        className="rounded-md border border-dark-200 px-3 py-1.5 text-xs transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isToggling
                          ? "Updating..."
                          : isPublished
                          ? "Unpublish"
                          : "Publish"}
                      </button>
                      <Link
                        href={`/dashboard/events/${event.slug}/edit`}
                        className="rounded-md border border-dark-200 px-3 py-1.5 text-xs transition hover:border-primary"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(event)}
                        disabled={isDuplicating}
                        className="rounded-md border border-dark-200 px-3 py-1.5 text-xs transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isDuplicating ? "Duplicating..." : "Duplicate"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(event)}
                        disabled={isDeleting}
                        className="rounded-md border border-red-900/50 px-3 py-1.5 text-xs text-red-400 transition hover:border-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventsTable;
