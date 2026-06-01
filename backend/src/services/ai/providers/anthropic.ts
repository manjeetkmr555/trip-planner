import Anthropic from "@anthropic-ai/sdk";
import { DayPlan } from "../../../types/itinerary";
import {
  ITINERARY_SYSTEM_PROMPT,
  buildItineraryUserPrompt,
} from "../prompts";
import { generateItineraryFromAiResponse } from "../responseParser";
import { countTripDays } from "../utils";

export async function generateWithAnthropic(
  destination: string,
  startDate: string,
  endDate: string
): Promise<DayPlan[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const client = new Anthropic({ apiKey });
  const dayCount = countTripDays(startDate, endDate);
  const model = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";

  return generateItineraryFromAiResponse(async () => {
    const response = await client.messages.create({
      model,
      // this is the maximum tokens that can be returned from the anthropic model that is called here.
      max_tokens: 4096,
      system: ITINERARY_SYSTEM_PROMPT,
      messages: [
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

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("Anthropic returned no text content");
    }

    return textBlock.text;
  });
}
