import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Combines the stored `date` (ISO string, normalized to UTC midnight) and
 * `time` (HH:mm, 24-hour) into a single Date - used as the registration
 * cutoff. Returns null if either value can't be parsed.
 */
export function getEventDateTime(date: string, time: string): Date | null {
  const datePart = date.slice(0, 10);
  const combined = new Date(`${datePart}T${time}:00.000Z`);

  return Number.isNaN(combined.getTime()) ? null : combined;
}

/**
 * Whether registration should be considered closed for an event - i.e. its
 * date/time has already passed. Kept as a plain function (not called inline
 * in a component body) since it reads the current time.
 */
export function isRegistrationClosed(date: string, time: string): boolean {
  const eventDateTime = getEventDateTime(date, time);
  return Boolean(eventDateTime && eventDateTime.getTime() <= Date.now());
}
