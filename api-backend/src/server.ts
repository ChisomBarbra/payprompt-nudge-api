import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Simple health check endpoint
app.get("/health", (_req, res) => {
    res.json ({
        status: "ok",
        service: "PayPrompt Nudge API",
        timestamp: new Date ().toISOString(),
    });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`✅ PayPrompt Nudge API running on http://localhost:${PORT}`);
});