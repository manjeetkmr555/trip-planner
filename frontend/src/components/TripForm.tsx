"use client";

import { FormEvent, useState } from "react";
import { createItinerary } from "@/lib/api";
import { Itinerary } from "@/lib/types";
import { ItineraryView } from "./ItineraryView";

function todayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function laterDate(a: string, b: string): string {
  return a >= b ? a : b;
}

export function TripForm() {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = todayString();
  const endDateMin = startDate ? laterDate(startDate, today) : today;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setItinerary(null);

    try {
      const result = await createItinerary({ destination, startDate, endDate });
      setItinerary(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="header">
        <p className="eyebrow">Trip Planner</p>
        <h1>Plan your next adventure</h1>
        <p className="subtitle">
          Enter a destination and travel dates — AI will build a day-by-day
          itinerary for you.
        </p>
      </header>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="destination">Destination</label>
          <input
            id="destination"
            type="text"
            placeholder="e.g. Tokyo, Paris, Bali"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="startDate">Start date</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              min={today}
              onChange={(e) => {
                const next = e.target.value;
                setStartDate(next);
                if (endDate && (endDate < next || endDate < today)) {
                  setEndDate("");
                }
              }}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="endDate">End date</label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              min={endDateMin}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Generating itinerary…" : "Generate itinerary"}
        </button>

        {error && <p className="error">{error}</p>}
      </form>

      {loading && (
        <div className="loading">
          <div className="spinner" />
          <p>Building your day-by-day plan…</p>
        </div>
      )}

      {itinerary && !loading && <ItineraryView itinerary={itinerary} />}
    </div>
  );
}
