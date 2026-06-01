export interface Activity {
  time: string;
  title: string;
  description: string;
}

export interface DayPlan {
  day: number;
  date: string;
  title: string;
  activities: Activity[];
}

export interface AiMetadata {
  provider: string;
  model: string;
  configured: boolean;
}

export interface Itinerary {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  days: DayPlan[];
  createdAt: string;
  generatedBy?: AiMetadata;
}

export interface CreateItineraryInput {
  destination: string;
  startDate: string;
  endDate: string;
}

export interface ApiError {
  error: string;
  details?: string | Record<string, string[]>;
}
