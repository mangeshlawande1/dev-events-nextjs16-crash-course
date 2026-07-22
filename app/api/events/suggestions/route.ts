import { NextRequest } from "next/server";

import { getEventSuggestions } from "@/lib/services/event.service";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get("q") ?? "";

    if (query.trim().length < 2) {
      return apiSuccess("Suggestions fetched successfully", { suggestions: [] });
    }

    const suggestions = await getEventSuggestions(query);

    return apiSuccess("Suggestions fetched successfully", { suggestions });
  } catch (error) {
    console.error("Failed to fetch suggestions:", error);
    return apiError("Failed to fetch suggestions", 500, { suggestions: [] });
  }
}
