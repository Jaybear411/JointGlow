import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "node:path";
import { fileURLToPath } from "node:url";
import chatRouter from "./routes/chat.js";
import vapiRouter from "./routes/vapi.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 8080;
const host = process.env.HOST || (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");

app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    mongo: mongoose.connection.readyState === 1 ? "connected" : "not_connected",
  });
});

app.use("/api/chat", chatRouter);
app.use("/api/vapi", vapiRouter);

const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

async function start() {
  if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI is not set. Conversations will use temporary in-memory storage.");
  } else {
    try {
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
      console.log("Connected to MongoDB");
    } catch (error) {
      if (process.env.REQUIRE_MONGODB === "true") {
        throw error;
      }

      console.warn("MongoDB connection failed. Falling back to temporary in-memory storage.");
      console.warn(error.message);
    }
  }

  app.listen(port, host, () => {
    console.log(`JointGlow app listening on http://${host}:${port}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
