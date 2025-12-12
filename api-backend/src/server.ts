import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import borrowerRoutes from "./routes/borrowers";
import loanRoutes from "./routes/loans";
import reminderRoutes from "./routes/reminders";
import repaymentRoutes from "./routes/repayments";
import webhooksRoutes from "./routes/webhooks";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Simple health check endpoint
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "PayPrompt Nudge API",
    timestamp: new Date().toISOString(),
  });
});

// Borrower routes
app.use("/borrowers", borrowerRoutes);

//Loan routes
app.use("/loans", loanRoutes);

// Reminder routes
app.use("/reminders", reminderRoutes);

// Repayment routes
app.use("/repayments", repaymentRoutes);

//Webhooks routes
app.use("/webhooks", webhooksRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ PayPrompt Nudge API running on http://localhost:${PORT}`);
});