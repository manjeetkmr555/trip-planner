import OpenAI from "openai";
import { DayPlan } from "../../../types/itinerary";
import {
  ITINERARY_SYSTEM_PROMPT,
  buildItineraryUserPrompt,
} from "../prompts";
import { generateItineraryFromAiResponse } from "../responseParser";
import { countTripDays } from "../utils";

export async function generateWithOpenAI(
  destination: string,
  startDate: string,
  endDate: string
): Promise<DayPlan[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const client = new OpenAI({ apiKey });
  const dayCount = countTripDays(startDate, endDate);
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  return generateItineraryFromAiResponse(async () => {
    const response = await client.chat.completions.create({
      model,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: ITINERARY_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildItineraryUserPrompt(
            destination,
            startDate,
            endDate,
            dayCount
          ),
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI returned an empty response");
    }

    return content;
  });
}
