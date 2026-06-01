import { ApiError, CreateItineraryInput, Itinerary } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function createItinerary(
  input: CreateItineraryInput
): Promise<Itinerary> {
  const response = await fetch(`${API_URL}/api/itineraries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    const err = data as ApiError;
    const detail =
      typeof err.details === "string"
        ? err.details
        : err.details
          ? Object.values(err.details).flat().join(", ")
          : undefined;
    throw new Error(detail ?? err.error ?? "Failed to create itinerary");
  }

  return data as Itinerary;
}
