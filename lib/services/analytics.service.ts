import { getAnalyticsSummary as fetchAnalyticsSummary } from "../repositories/analytics.repository";

export async function getAnalyticsSummary() {
  return fetchAnalyticsSummary();
}
