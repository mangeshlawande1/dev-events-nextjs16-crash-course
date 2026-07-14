export type EventMode = "online" | "offline" | "hybrid";

export interface EventFormValues {
  title: string;
  description: string;
  overview: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: EventMode;
  audience: string;
  organizer: string;
  agenda: string[];
  tags: string[];
  image: File | null;
}

export interface EventResponse {
  _id: string;
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: EventMode;
  audience: string;
  organizer: string;
  agenda: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventResponse {
  message: string;
  event: EventResponse;
}

export interface ApiErrorResponse {
  message: string;
}