import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { saveItinerary, getItineraryById, listItineraries } from "../db/database";
import { generateItinerary } from "../services/ai";
import { countTripDays } from "../services/ai/utils";
import { Itinerary } from "../types/itinerary";

const MAX_TRIP_DAYS = 10;

function isTripDurationWithinLimit(startDate: string, endDate: string): boolean {
  return countTripDays(startDate, endDate) <= MAX_TRIP_DAYS;
}

const createItinerarySchema = z
  .object({
    destination: z.string().min(1, "Destination is required").max(200),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format"),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "End date must be on or after start date",
    path: ["endDate"],
  })
  .refine((data) => isTripDurationWithinLimit(data.startDate, data.endDate), {
    message: "We do not support itinerary for more than 10 days",
    path: ["endDate"],
  });

export const itineraryRouter = Router();

itineraryRouter.post("/", async (req: Request, res: Response) => {
  const parsed = createItinerarySchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { destination, startDate, endDate } = parsed.data;

  try {
    const { days, ai } = await generateItinerary(destination, startDate, endDate);

    const itinerary: Itinerary = {
      id: uuidv4(),
      destination,
      startDate,
      endDate,
      days,
      createdAt: new Date().toISOString(),
      generatedBy: ai,
    };

    const saved = saveItinerary(itinerary);

    res.status(201).json(saved);
  } catch (err) {
    console.error("Failed to generate itinerary:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Failed to generate itinerary", details: message });
  }
});

itineraryRouter.get("/", (_req: Request, res: Response) => {
  const itineraries = listItineraries();
  res.json(itineraries);
});

itineraryRouter.get("/:id", (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const itinerary = getItineraryById(id);

  if (!itinerary) {
    res.status(404).json({ error: "Itinerary not found" });
    return;
  }

  res.json(itinerary);
});
