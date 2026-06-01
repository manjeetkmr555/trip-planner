# Trip Planner — Frontend

The **frontend** is the website you see in your browser. It is built with **Next.js**, **React**, and **TypeScript**.

For a full beginner-friendly guide (frontend, backend, database, and API integration), see the main **[README](../README.md)** in the project root.

---

## What this folder does

- Shows the trip form (destination + dates)
- Calls the backend API when you submit
- Displays the AI-generated day-by-day itinerary

## Quick start (local dev)

**Prerequisites:** Backend must be running on port 3001 (see `backend/README.md`).

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open **http://localhost:3000**

## Key files

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Home page |
| `src/components/TripForm.tsx` | Form, loading, errors |
| `src/components/ItineraryView.tsx` | Day cards and activities |
| `src/lib/api.ts` | HTTP calls to the backend |
| `src/lib/types.ts` | TypeScript types for API data |

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | Backend API base URL |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with hot reload (port 3000) |
| `npm run build` | Production build |
| `npm start` | Run production server |
