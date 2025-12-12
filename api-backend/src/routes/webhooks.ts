import { Router } from "express";

const router = Router();

const nowIso = () => new Date().toISOString();

function buildReminderWebhookEvent(type: "reminder.sent" | "reminder.failed") {
  return {
    id: "evt_01HFQ3J5V6M9T2",
    type,
    createdAt: nowIso(),
    data: {
      reminder: {
        id: "rem_1",
        loanId: "loan_98765",
        type: "sms",
        triggerType: "before_due",
        daysOffset: 3,
        channelFallback: ["email"],
        status: type === "reminder.sent" ? "sent" : "failed",
        createdAt: nowIso(),
        lastSentAt: type === "reminder.sent" ? nowIso() : null,
      },
      delivery: {
        channel: "sms",
        status: type === "reminder.sent" ? "sent" : "failed",
        attempts: 1,
        lastAttemptAt: nowIso(),
        failureReason: type === "reminder.failed" ? "Provider timeout" : null,
      },
    },
  };
}

// ✅ 1) Example payloads (what your Bruno screenshots are trying to do, but on YOUR API)
router.get("/examples/reminder.sent", (req, res) => {
  return res.json(buildReminderWebhookEvent("reminder.sent"));
});

router.get("/examples/reminder.failed", (req, res) => {
  return res.json(buildReminderWebhookEvent("reminder.failed"));
});

// ✅ 2) Trigger test webhook delivery to a targetUrl (matches your spec)
router.post("/reminders/test", async (req, res) => {
  const { targetUrl, eventType } = req.body as {
    targetUrl?: string;
    eventType?: "reminder.sent" | "reminder.failed";
  };

  if (!targetUrl || !eventType) {
    return res.status(400).json({
      error: { code: "INVALID_INPUT", message: "targetUrl and eventType are required." },
    });
  }

  if (eventType !== "reminder.sent" && eventType !== "reminder.failed") {
    return res.status(400).json({
      error: { code: "INVALID_INPUT", message: "eventType must be reminder.sent or reminder.failed." },
    });
  }

  const payload = buildReminderWebhookEvent(eventType);

  try {
    // Node 18+ has fetch. If yours doesn't, install node-fetch.
    await fetch(targetUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Spec says queued → 202
    return res.status(202).json({ status: "queued" });
  } catch (e: any) {
    return res.status(500).json({
      error: { code: "WEBHOOK_SEND_FAILED", message: e?.message || "Failed to send webhook." },
    });
  }
});

export default router;