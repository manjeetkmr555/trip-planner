import { z } from "zod";
import { DayPlan } from "../../types/itinerary";

const activitySchema = z.object({
  time: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

const dayPlanSchema = z.object({
  day: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().min(1),
  activities: z.array(activitySchema).min(1).max(8),
});

export const itineraryResponseSchema = z.object({
  days: z.array(dayPlanSchema).min(1),
});

export function parseItineraryResponse(raw: unknown): DayPlan[] {
  const result = itineraryResponseSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(
      `Invalid itinerary from AI: ${result.error.issues.map((i) => i.message).join(", ")}`
    );
  }
  return result.data.days;
}
