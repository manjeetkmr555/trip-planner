# Trip Planner

A full-stack web app that helps you plan a trip. You enter a **destination** and **travel dates**, and the app uses AI to build a **day-by-day itinerary** (activities with times). Every plan is saved so you can look it up later.

This README is written for people who are **new to software development**. Each major part of the project — frontend, backend, database, and API integration — is explained in its own section below.

---

## Table of contents

1. [Key terms (start here if you are new)](#key-terms-start-here-if-you-are-new)
2. [What this app does](#what-this-app-does)
3. [How the pieces fit together](#how-the-pieces-fit-together)
4. [Frontend](#frontend)
5. [Backend](#backend)
6. [Database](#database)
7. [API integration](#api-integration)
8. [AI integration (external API)](#ai-integration-external-api)
9. [Getting started](#getting-started)
10. [Project layout](#project-layout)
11. [Troubleshooting](#troubleshooting)

---

## Key terms (start here if you are new)

| Term | Simple explanation |
|------|--------------------|
| **Frontend** | The part you see and click in your **web browser** — forms, buttons, and the itinerary display. |
| **Backend** | A **server program** that runs on your computer (or in Docker). It handles logic the browser should not do alone, like calling AI and saving data. |
| **Database** | A place to **store data permanently** — here, saved trip plans. This project uses **SQLite**, which is a single file on disk. |
| **API** | A set of **URLs the frontend can call** to ask the backend to do something (create a trip, list trips, etc.). |
| **HTTP request** | How the frontend talks to the backend — like sending a letter with a question and getting a reply back. |
| **JSON** | A text format for structured data, e.g. `{"destination": "Paris", "startDate": "2026-06-01"}`. Both frontend and backend use it. |
| **Environment variables** | Secret or config values stored in a `.env` file (API keys, ports). They are **not** committed to git. |
| **Docker** | A tool that runs the app in **containers** so you do not have to install Node.js and dependencies manually. |

---

## What this app does

1. You open the website in your browser.
2. You type a destination (e.g. "Tokyo") and pick start/end dates.
3. You click **Generate itinerary**.
4. The backend asks an AI (Claude, OpenAI, or a built-in mock) for a day-by-day plan.
5. The backend saves the plan in SQLite and sends it back to the browser.
6. The frontend shows each day as a card with timed activities.

**Limits:** Trips can be at most **10 days** long. Dates must be today or in the future.

---

## How the pieces fit together

```text
┌─────────────────────────────────────────────────────────────────┐
│  YOU (browser)                                                  │
│  http://localhost:3000                                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │  HTTP (API calls)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND  (Next.js + React)          folder: frontend/       │
│  • Shows the form and itinerary cards                           │
│  • Sends requests to the backend                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │  POST /api/itineraries  (JSON)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND  (Node.js + Express)           folder: backend/        │
│  • Validates your input                                         │
│  • Calls the AI provider                                        │
│  • Saves the result to the database                             │
│  • Returns JSON to the frontend                                 │
└──────────────┬─────────────────────────────┬────────────────────┘
               │                             │
               ▼                             ▼
┌──────────────────────────┐   ┌──────────────────────────────────┐
│  DATABASE (SQLite)       │   │  AI SERVICE (external)           │
│  itineraries.db          │   │  Anthropic Claude / OpenAI / mock│
│  Saved trip plans        │   │  Generates the day-by-day plan   │
└──────────────────────────┘   └──────────────────────────────────┘
```

**Typical flow when you click "Generate itinerary":**

```text
TripForm.tsx  →  api.ts (fetch)  →  backend route  →  AI  →  database  →  back to browser  →  ItineraryView.tsx
```

---

## Frontend

The frontend is everything that runs **in your browser**.

### What it is built with

| Technology | Role |
|------------|------|
| **Next.js 15** | React framework — handles pages, routing, and building the app |
| **React 19** | UI library — components like forms and cards |
| **TypeScript** | JavaScript with types — catches mistakes before you run the code |

### What the frontend is responsible for

- Showing the trip form (destination, dates, submit button)
- Calling the backend API when you submit
- Showing a loading spinner while the AI works
- Displaying errors if something goes wrong
- Rendering the day-by-day itinerary as cards

### Important files

```text
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx         ← Home page — renders TripForm
│   │   ├── layout.tsx       ← Wraps every page (title, fonts, etc.)
│   │   └── globals.css      ← All visual styles
│   ├── components/
│   │   ├── TripForm.tsx     ← Form, submit handler, loading/error state
│   │   └── ItineraryView.tsx ← Displays each day and its activities
│   └── lib/
│       ├── api.ts           ← Functions that call the backend (fetch)
│       └── types.ts         ← TypeScript shapes for Itinerary, Activity, etc.
├── .env.example             ← Copy to .env.local for local dev
└── package.json             ← Dependencies and npm scripts
```

### How the form works (simplified)

1. `TripForm.tsx` keeps state: destination, dates, loading, error, and the result itinerary.
2. On submit, it calls `createItinerary()` from `lib/api.ts`.
3. `api.ts` sends a **POST** request to `http://localhost:3001/api/itineraries` with JSON body.
4. When the response arrives, `TripForm` passes the itinerary to `ItineraryView.tsx`.

### Frontend environment variables

| Variable | Default | What it does |
|----------|---------|--------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | Where the backend API lives. The `NEXT_PUBLIC_` prefix means the browser can read it. |

For local development:

```bash
cd frontend
cp .env.example .env.local
```

### Frontend commands

| Command | What it does |
|---------|--------------|
| `npm install` | Download dependencies (first time only) |
| `npm run dev` | Start dev server at http://localhost:3000 (hot reload) |
| `npm run build` | Create a production build |
| `npm start` | Run the production build |

---

## Backend

The backend is a **server** that listens for HTTP requests and responds with JSON.

### What it is built with

| Technology | Role |
|------------|------|
| **Node.js** | JavaScript runtime on the server |
| **Express** | Web framework — defines routes like `GET /health` |
| **TypeScript** | Typed JavaScript |
| **Zod** | Validates incoming request data (destination, dates) |
| **better-sqlite3** | Talks to the SQLite database file |

### What the backend is responsible for

- Exposing API endpoints under `/api/itineraries`
- Validating that destination and dates are correct
- Calling the AI to generate a plan
- Saving every generated itinerary to SQLite
- Returning JSON responses (or error messages)

### Important files

```text
backend/
├── src/
│   ├── index.ts              ← Starts the server, mounts routes, /health
│   ├── routes/
│   │   └── itinerary.ts      ← POST create, GET list, GET by id
│   ├── db/
│   │   └── database.ts       ← SQLite: save, list, get by id
│   ├── services/ai/
│   │   ├── index.ts          ← Picks AI provider (anthropic / openai / mock)
│   │   ├── prompts.ts        ← Instructions sent to the AI
│   │   ├── schema.ts         ← Validates AI JSON response
│   │   ├── responseParser.ts ← Parses AI text into day plans
│   │   └── providers/
│   │       ├── anthropic.ts  ← Claude API
│   │       ├── openai.ts     ← OpenAI API
│   │       └── mock.ts       ← Sample data (no API key needed)
│   └── types/
│       └── itinerary.ts      ← Shared TypeScript types
├── .env.example              ← Copy to .env and add your API key
└── package.json
```

### What happens on `POST /api/itineraries`

1. **Validate** — `itinerary.ts` checks destination, date format (`YYYY-MM-DD`), end ≥ start, max 10 days.
2. **Generate** — `services/ai/index.ts` calls the configured AI provider.
3. **Save** — `database.ts` inserts a row into SQLite with a new UUID.
4. **Respond** — Returns the full itinerary as JSON with status `201 Created`.

### Backend environment variables

| Variable | Default | What it does |
|----------|---------|--------------|
| `PORT` | `3001` | Port the server listens on |
| `DATABASE_PATH` | `./data/itineraries.db` | Path to the SQLite file |
| `AI_PROVIDER` | `anthropic` | `anthropic`, `openai`, or `mock` |
| `ANTHROPIC_API_KEY` | — | Your Claude API key (required if using anthropic) |
| `ANTHROPIC_MODEL` | `claude-3-5-haiku-latest` | Which Claude model to use |
| `OPENAI_API_KEY` | — | Your OpenAI key (required if using openai) |
| `OPENAI_MODEL` | `gpt-4o-mini` | Which OpenAI model to use |

**Easiest way to test without an API key:** set `AI_PROVIDER=mock` in `backend/.env`.

### Backend commands

| Command | What it does |
|---------|--------------|
| `npm install` | Download dependencies |
| `npm run dev` | Start with hot reload (uses `tsx watch`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production server |
| `npm run typecheck` | Check types without building |

---

## Database

This project uses **SQLite** — a lightweight database stored as **one file** on disk. There is no separate database server to install.

### Why SQLite here?

- Simple for learning: one file, no extra service
- Perfect for saving a list of trip plans on a single machine
- Works the same locally and inside Docker (with a volume for persistence)

### Where the file lives

| Environment | Path |
|-------------|------|
| Local dev | `backend/data/itineraries.db` |
| Docker | `/app/data/itineraries.db` (stored in Docker volume `itinerary-data`) |

The folder is created automatically the first time the backend runs.

### Table structure

One table: **`itineraries`**

| Column | Type | Example | Purpose |
|--------|------|---------|---------|
| `id` | TEXT | `"a1b2c3d4-..."` | Unique ID (UUID) for each trip |
| `destination` | TEXT | `"Paris"` | Where you are going |
| `start_date` | TEXT | `"2026-06-01"` | Trip start (YYYY-MM-DD) |
| `end_date` | TEXT | `"2026-06-03"` | Trip end |
| `days_json` | TEXT | `[{"day":1,...}]` | Full itinerary as JSON string |
| `generated_by_json` | TEXT | `{"provider":"anthropic",...}` | Which AI made the plan |
| `created_at` | TEXT | `"2026-05-31T12:00:00.000Z"` | When it was saved |

The day-by-day plan is stored as **JSON inside a text column** (`days_json`). When you fetch a trip, the backend parses that JSON back into objects.

### Database operations (in code)

| Function | File | What it does |
|----------|------|--------------|
| `saveItinerary()` | `database.ts` | Insert a new row after AI generation |
| `getItineraryById()` | `database.ts` | Fetch one trip by UUID |
| `listItineraries()` | `database.ts` | Fetch all trips, newest first |
| `countItineraries()` | `database.ts` | Used by `/health` to show how many are saved |

### Clearing all saved trips

**Local dev:** delete the file `backend/data/itineraries.db` (backend recreates it on next start).

**Docker:**

```bash
docker compose down -v
```

The `-v` flag removes the volume. Next `docker compose up --build` starts with an empty database.

---

## API integration

The **API** is how the frontend and backend communicate. The frontend never talks to the AI or database directly — it only talks to the backend.

### Base URL

| Environment | URL |
|-------------|-----|
| Local / Docker | `http://localhost:3001` |

The frontend reads this from `NEXT_PUBLIC_API_URL` (see `frontend/src/lib/api.ts`).

### Endpoints

| Method | Path | Who uses it | Description |
|--------|------|-------------|-------------|
| `GET` | `/health` | You / debugging | Server, AI, and database status |
| `POST` | `/api/itineraries` | Frontend form | Create a new itinerary |
| `GET` | `/api/itineraries` | (available, not used by UI yet) | List all saved itineraries |
| `GET` | `/api/itineraries/:id` | (available, not used by UI yet) | Get one itinerary by ID |

### Create itinerary — request and response

**Request** (what the frontend sends):

```http
POST http://localhost:3001/api/itineraries
Content-Type: application/json

{
  "destination": "Paris",
  "startDate": "2026-06-01",
  "endDate": "2026-06-03"
}
```

**Success response** (`201 Created`):

```json
{
  "id": "abc-123-uuid",
  "destination": "Paris",
  "startDate": "2026-06-01",
  "endDate": "2026-06-03",
  "days": [
    {
      "day": 1,
      "date": "2026-06-01",
      "title": "Arrival & Left Bank",
      "activities": [
        {
          "time": "09:00",
          "title": "Eiffel Tower",
          "description": "Start with iconic views from the Trocadéro."
        }
      ]
    }
  ],
  "createdAt": "2026-05-31T12:00:00.000Z",
  "generatedBy": {
    "provider": "anthropic",
    "model": "claude-3-5-haiku-latest",
    "configured": true
  }
}
```

**Validation error** (`400 Bad Request`):

```json
{
  "error": "Validation failed",
  "details": {
    "endDate": ["We do not support itinerary for more than 10 days"]
  }
}
```

### How the frontend calls the API

All API logic lives in `frontend/src/lib/api.ts`:

```typescript
// Simplified — the real file handles errors too
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function createItinerary(input) {
  const response = await fetch(`${API_URL}/api/itineraries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return response.json();
}
```

`fetch` is the browser’s built-in way to make HTTP requests. The backend uses **CORS** (`cors` middleware in `index.ts`) so the browser is allowed to call it from a different port (3000 → 3001).

### Test the API with curl (no browser needed)

```bash
# Health check
curl http://localhost:3001/health

# Create a trip
curl -X POST http://localhost:3001/api/itineraries \
  -H "Content-Type: application/json" \
  -d '{"destination":"Paris","startDate":"2026-06-01","endDate":"2026-06-02"}'

# List all saved trips
curl http://localhost:3001/api/itineraries
```

---

## AI integration (external API)

The backend calls an **external AI service** over the internet. This is separate from your frontend ↔ backend API.

### Supported providers

| Provider | Env value | API key variable | Best for |
|----------|-----------|------------------|----------|
| **Anthropic Claude** | `anthropic` | `ANTHROPIC_API_KEY` | Default; get key at [console.anthropic.com](https://console.anthropic.com) |
| **OpenAI** | `openai` | `OPENAI_API_KEY` | Alternative; get key at [platform.openai.com](https://platform.openai.com) |
| **Mock** | `mock` | None | Testing without spending money or needing internet |

### How AI generation works

1. Backend builds a **system prompt** (`prompts.ts`) telling the AI to return JSON only.
2. Backend sends destination, dates, and day count as the **user message**.
3. AI returns text (hopefully valid JSON with a `days` array).
4. `responseParser.ts` and `schema.ts` validate and parse the response.
5. If parsing fails, the request returns a `500` error.

### Example `.env` for real AI (Anthropic)

```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-real-key-here
ANTHROPIC_MODEL=claude-3-5-haiku-latest
```

### Example `.env` for testing without AI

```env
AI_PROVIDER=mock
```

---

## Getting started

### Prerequisites

**Option A — Docker (recommended for beginners)**

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Verify: `docker --version` and `docker compose version`

**Option B — Local development (two terminals)**

1. Install [Node.js 20+](https://nodejs.org/) (includes `npm`)

---

### Option A: Run with Docker

From the project root (`trip-planner/`):

**1. Create backend config**

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

- For quick testing: `AI_PROVIDER=mock`
- For real trips: set `AI_PROVIDER=anthropic` and add your `ANTHROPIC_API_KEY`

**2. Start everything**

```bash
docker compose up --build
```

**3. Open the app**

| Service | URL |
|---------|-----|
| Frontend (website) | http://localhost:3000 |
| Backend (API) | http://localhost:3001 |

**Stop:** press `Ctrl+C` in the terminal, or run `docker compose down`.

**Note:** Docker runs a production build. After you change code, rebuild:

| What you changed | Command |
|------------------|---------|
| Frontend files | `docker compose up --build frontend` |
| Backend files or `.env` | `docker compose up --build backend` |

---

### Option B: Run locally (hot reload)

Better for active development — saves automatically reload the app.

**Terminal 1 — backend:**

```bash
cd backend
cp .env.example .env
# Edit .env — set AI_PROVIDER=mock or add API key
npm install
npm run dev
```

**Terminal 2 — frontend:**

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000

---

## Project layout

```text
trip-planner/
├── README.md                 ← You are here
├── docker-compose.yml        ← Runs frontend + backend containers
├── frontend/                 ← Browser app (Next.js)
│   ├── src/app/              ← Pages and styles
│   ├── src/components/       ← TripForm, ItineraryView
│   └── src/lib/              ← API client and types
└── backend/                  ← API server (Express)
    ├── src/index.ts          ← Server entry
    ├── src/routes/           ← HTTP handlers
    ├── src/db/               ← SQLite access
    └── src/services/ai/      ← AI providers and prompts
```

More detail per folder: `frontend/README.md` and `backend/README.md`.

---

## Troubleshooting

| Problem | What to try |
|---------|-------------|
| `docker: command not found` | Install and start Docker Desktop |
| Port 3000 or 3001 already in use | Stop other apps or run `docker compose down` |
| "Failed to create itinerary" in the UI | Check backend logs; try `AI_PROVIDER=mock` in `backend/.env` |
| Frontend cannot reach backend | Is backend running? Try `curl http://localhost:3001/health` |
| UI changes not visible (Docker) | Rebuild: `docker compose up --build frontend`, then hard-refresh browser |
| AI / API key errors | Use `AI_PROVIDER=mock` for testing, or add a valid key and restart backend |
| Empty or old trip data | Wipe DB: `docker compose down -v` (Docker) or delete `backend/data/itineraries.db` (local) |

---

## Quick reference

| Task | Command |
|------|---------|
| Start with Docker | `docker compose up --build` |
| Start backend locally | `cd backend && npm run dev` |
| Start frontend locally | `cd frontend && npm run dev` |
| Health check | `curl http://localhost:3001/health` |
| Stop Docker | `Ctrl+C` or `docker compose down` |
| Delete all saved trips (Docker) | `docker compose down -v` |
