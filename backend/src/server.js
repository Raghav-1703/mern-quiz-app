import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import { getLeaderboard } from "./controllers/resultController.js";
import { requireAuth } from "./middleware/authMiddleware.js";

dotenv.config();
connectDB();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // fallback allow for dev
    },
    credentials: true,
  })
);

app.use(express.json());

// API Routes
app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date() }));
app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/results", resultRoutes);
app.get("/api/leaderboard/:quizId", requireAuth, getLeaderboard);

// In production, serve the built React app from ../../frontend/dist
if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(__dirname, "../../frontend/dist");
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

// Fallback 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Central error handler
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err);
  res.status(500).json({
    message: err.message || "An unexpected error occurred on the server.",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Quiz Application API running on port ${PORT} (0.0.0.0)`)
);

export default app;
