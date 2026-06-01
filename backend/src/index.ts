import "dotenv/config";
import express from "express";
import cors from "cors";
import { itineraryRouter } from "./routes/itinerary";
import { getDb, getDatabaseInfo } from "./db/database";
import { getAiStatus } from "./services/ai";

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    ai: getAiStatus(),
    database: getDatabaseInfo(),
  });
});

app.use("/api/itineraries", itineraryRouter);

getDb();

const ai = getAiStatus();
const dbInfo = getDatabaseInfo();
app.listen(port, () => {
  console.log(`Trip planner API running at http://localhost:${port}`);
  console.log(`Database: ${dbInfo.path} (${dbInfo.count} itineraries saved)`);
  console.log(
    `AI provider: ${ai.provider} (${ai.model})${ai.configured ? "" : " — add API key in .env for real itineraries"}`
  );
});
