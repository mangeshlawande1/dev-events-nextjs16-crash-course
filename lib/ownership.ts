import type { Session } from "next-auth";

/**
 * Whether the given session's user is allowed to manage (edit/delete/
 * duplicate/toggle status on) an event with the given createdBy value.
 * Admins can manage anything. Organizers only their own. Events with no
 * owner (created before auth existed) are admin-only.
 */
export function canManageEvent(
  eventCreatedBy: unknown,
  session: Session | null
): boolean {
  if (!session?.user) return false;
  if (session.user.role === "admin") return true;

  if (!eventCreatedBy) return false;

  return eventCreatedBy.toString() === session.user.id;
}
