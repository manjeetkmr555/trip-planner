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

export interface CreateItineraryRequest {
  destination: string;
  startDate: string;
  endDate: string;
}

export interface StoredItineraryRow {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  days_json: string;
  generated_by_json: string | null;
  created_at: string;
}
