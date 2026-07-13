
  import {
    findAllEvents,
    findEventBySlug,
    findSimilarEvents,
  } from "../repositories/event.repository";

  export async function getAllEvents() {

    return findAllEvents();
  }

  export async function getEventBySlug(slug: string) {

    return findEventBySlug(slug);
  }

  export async function getSimilarEventsBySlug(slug: string) {

    return findSimilarEvents(slug);
  }