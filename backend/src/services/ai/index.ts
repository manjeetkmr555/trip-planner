import { DayPlan } from "../../types/itinerary";
import { generateWithAnthropic } from "./providers/anthropic";
import { generateWithMock } from "./providers/mock";
import { generateWithOpenAI } from "./providers/openai";
import { ITINERARY_SYSTEM_PROMPT } from "./prompts";

export type AiProvider = "anthropic" | "openai" | "mock";

export interface AiStatus {
  provider: AiProvider;
  model: string;
  configured: boolean;
}

const PLACEHOLDER_KEYS = new Set([
  "your-openai-api-key-here",
  "your-anthropic-api-key-here",
]);

function isRealKey(key: string | undefined): boolean {
  return Boolean(key && key.trim() && !PLACEHOLDER_KEYS.has(key.trim()));
}

export function resolveAiProvider(): AiProvider {
  const configured = process.env.AI_PROVIDER?.toLowerCase();
  if (configured === "anthropic" || configured === "openai" || configured === "mock") {
    return configured;
  }

  // Default to Anthropic for this project
  return "anthropic";
}

function getModelForProvider(provider: AiProvider): string {
  switch (provider) {
    case "anthropic":
      return process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";
    case "openai":
      return process.env.OPENAI_MODEL ?? "gpt-4o-mini";
    case "mock":
      return "sample-data";
  }
}

export function getAiStatus(): AiStatus {
  const provider = resolveAiProvider();
  const configured =
    provider === "mock"
      ? false
      : provider === "anthropic"
        ? isRealKey(process.env.ANTHROPIC_API_KEY)
        : isRealKey(process.env.OPENAI_API_KEY);

  return {
    provider,
    model: getModelForProvider(provider),
    configured,
  };
}

export async function generateItinerary(
  destination: string,
  startDate: string,
  endDate: string
): Promise<{ days: DayPlan[]; ai: AiStatus }> {
  const provider = resolveAiProvider();
  const ai: AiStatus = {
    provider,
    model: getModelForProvider(provider),
    configured: provider !== "mock",
  };

  let days: DayPlan[];

  switch (provider) {
    case "anthropic":
      if (!isRealKey(process.env.ANTHROPIC_API_KEY)) {
        throw new Error(
          "ANTHROPIC_API_KEY is missing. Add your key to .env (get one at console.anthropic.com)"
        );
      }
      days = await generateWithAnthropic(destination, startDate, endDate);
      break;
    case "openai":
      days = await generateWithOpenAI(destination, startDate, endDate);
      break;
    case "mock":
      console.warn("AI_PROVIDER=mock — returning sample itinerary (no API call).");
      days = await generateWithMock(destination, startDate, endDate);
      break;
  }

  return { days, ai };
}

export { ITINERARY_SYSTEM_PROMPT as ITINERARY_PROMPT };
