import { DayPlan } from "../../types/itinerary";
import { parseItineraryResponse } from "./schema";
import { extractJsonFromText } from "./utils";

export const AI_RESPONSE_ERROR_MESSAGE =
  "There is some error from the server side. Please try after some time.";

export async function generateItineraryFromAiResponse(
  fetchText: () => Promise<string>
): Promise<DayPlan[]> {
  let lastParseError: unknown;

  for (let attempt = 0; attempt < 2; attempt++) {
    const text = await fetchText();
    try {
      const parsed = extractJsonFromText(text);
      return parseItineraryResponse(parsed);
    } catch (err) {
      lastParseError = err;
      if (attempt === 0) {
        console.warn("AI response was not valid JSON, retrying once...", err);
      }
    }
  }

  console.error("AI response still not valid JSON after retry:", lastParseError);
  throw new Error(AI_RESPONSE_ERROR_MESSAGE);
}
