
  import { cache } from "react";
  import {
    findAllEvents,
    findEventBySlug,
    findEventSuggestions,
    findSimilarEvents,
    findTrendingEvents,
    getFilterOptions,
    type EventQueryFilters,
  } from "../repositories/event.repository";

  /** Public homepage/search - published events only. */
  export async function getAllEvents(page = 1, filters: EventQueryFilters = {}) {

    return findAllEvents(page, undefined, {}, filters);
  }

  /** Dashboard - every event, including drafts, so organizers can manage them. */
  export async function getAllEventsForDashboard(page = 1) {

    return findAllEvents(page, undefined, { includeDrafts: true });
  }

  /**
   * Public event detail page - published only (drafts 404 for visitors).
   * Wrapped in React's cache() so generateMetadata() and the page component
   * share a single DB call instead of each fetching independently.
   */
  export const getEventBySlug = cache(async (slug: string) => {

    return findEventBySlug(slug);
  });

  /** Dashboard edit page - any status, since organizers must be able to edit their own drafts. */
  export async function getEventForEdit(slug: string) {

    return findEventBySlug(slug, { includeDrafts: true });
  }

  export async function getSimilarEventsBySlug(slug: string) {

    return findSimilarEvents(slug);
  }

  /** Distinct locations/tags for the homepage filter dropdowns. */
  export async function getEventFilterOptions() {

    return getFilterOptions();
  }

  /** Typeahead suggestions for the search bar. */
  export async function getEventSuggestions(query: string) {

    return findEventSuggestions(query);
  }

  /** Homepage "Trending Events" section - recent booking momentum. */
  export async function getTrendingEvents() {

    return findTrendingEvents();
  }
