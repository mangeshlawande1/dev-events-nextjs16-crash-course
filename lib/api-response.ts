import { NextResponse } from "next/server";

/**
 * Success response - always includes a `message`, plus whatever
 * route-specific data (event, events, suggestions, etc.) is passed in.
 */
export function apiSuccess<T extends Record<string, unknown>>(
  message: string,
  data?: T,
  status = 200
) {
  return NextResponse.json({ message, ...data }, { status });
}

/**
 * Error response - message plus optional extra fields (e.g. Zod's
 * treeifyError() output under `errors`).
 */
export function apiError<T extends Record<string, unknown>>(
  message: string,
  status = 500,
  extra?: T
) {
  return NextResponse.json({ message, ...extra }, { status });
}
