
  import {
    findAllEvents,
    findEventBySlug,
    findSimilarEvents,
  } from "../repositories/event.repository";

  export async function getAllEvents(page = 1) {

    return findAllEvents(page);
  }

  export async function getEventBySlug(slug: string) {

    return findEventBySlug(slug);
  }

  export async function getSimilarEventsBySlug(slug: string) {

    return findSimilarEvents(slug);
  }