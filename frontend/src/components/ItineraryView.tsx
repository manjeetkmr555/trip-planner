import { Itinerary } from "@/lib/types";

interface ItineraryViewProps {
  itinerary: Itinerary;
}

function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function ItineraryView({ itinerary }: ItineraryViewProps) {
  return (
    <section className="itinerary">
      <div className="itinerary-header">
        <div>
          <h2>{itinerary.destination}</h2>
          <p className="trip-dates">
            {formatDate(itinerary.startDate)} → {formatDate(itinerary.endDate)}
          </p>
        </div>
        {/* {itinerary.generatedBy && (
          <span className="badge">
            AI · {itinerary.generatedBy.model}
          </span>
        )} */}
      </div>

      <div className="days">
        {itinerary.days.map((day) => (
          <article key={`${day.day}-${day.date}`} className="day-card">
            <header className="day-header">
              <span className="day-number">Day {day.day}</span>
              <div>
                <h3>{day.title}</h3>
                <p className="day-date">{formatDate(day.date)}</p>
              </div>
            </header>

            <ul className="activities">
              {day.activities.map((activity, index) => (
                <li key={`${activity.time}-${index}`} className="activity">
                  <time>{activity.time}</time>
                  <div>
                    <strong>{activity.title}</strong>
                    <p>{activity.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
