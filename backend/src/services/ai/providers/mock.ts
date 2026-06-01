import { DayPlan } from "../../../types/itinerary";
import { countTripDays } from "../utils";

export async function generateWithMock(
  destination: string,
  startDate: string,
  endDate: string
): Promise<DayPlan[]> {
  const dayCount = countTripDays(startDate, endDate);
  const themes = [
    "Arrival & First Impressions",
    "Culture & Landmarks",
    "Local Food & Neighborhoods",
    "Hidden Gems",
    "Relax & Departure",
  ];

  const days: DayPlan[] = [];

  for (let i = 0; i < dayCount; i++) {
    const date = new Date(`${startDate}T00:00:00`);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];

    days.push({
      day: i + 1,
      date: dateStr,
      title: themes[i % themes.length],
      activities: [
        {
          time: "09:00",
          title: "Morning exploration",
          description: `Start your day in the heart of ${destination} with a walk through a central district.`,
        },
        {
          time: "12:30",
          title: "Local lunch",
          description: `Try a well-known local restaurant or market food in ${destination}.`,
        },
        {
          time: "15:00",
          title: "Afternoon highlight",
          description: `Visit a signature attraction that shows what makes ${destination} special.`,
        },
        {
          time: "19:00",
          title: "Evening wind-down",
          description: "Enjoy dinner and a relaxed stroll through a scenic neighborhood.",
        },
      ],
    });
  }

  return days;
}
