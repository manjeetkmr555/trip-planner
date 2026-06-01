# Trip Planner — Backend

The **backend** is the API server. It validates input, calls AI to generate itineraries, saves them to SQLite, and returns JSON to the frontend.

For a full beginner-friendly guide (frontend, backend, database, and API integration), see the main **[README](../README.md)** in the project root.

---

## What this folder does

- Exposes REST API at `http://localhost:3001`
- Generates itineraries via Anthropic, OpenAI, or mock data
- Persists every trip in a SQLite file

## Quick start (local dev)

```bash
cp .env.example .env
# Edit .env — use AI_PROVIDER=mock for testing without an API key
npm install
npm run dev
```

API: **http://localhost:3001** — try `curl http://localhost:3001/health`

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Server, AI, and database status |
| POST | `/api/itineraries` | Create and save a new itinerary |
| GET | `/api/itineraries` | List all saved itineraries |
| GET | `/api/itineraries/:id` | Get one itinerary by ID |

## Key files

| File | Purpose |
|------|---------|
| `src/index.ts` | Server startup and `/health` |
| `src/routes/itinerary.ts` | Create / list / get handlers |
| `src/db/database.ts` | SQLite read and write |
| `src/services/ai/` | AI providers, prompts, parsing |

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `DATABASE_PATH` | `./data/itineraries.db` | SQLite file path |
| `AI_PROVIDER` | `anthropic` | `anthropic`, `openai`, or `mock` |
| `ANTHROPIC_API_KEY` | — | Required for real Claude trips |
| `OPENAI_API_KEY` | — | Required if `AI_PROVIDER=openai` |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run production build |
| `npm run typecheck` | Type-check only |
