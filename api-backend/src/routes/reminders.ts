import { Router } from "express";

const router = Router();

type ReminderChannel = "sms" | "email" | "whatsapp";
type ReminderTrigger = "before_due" | "on_due" | "after_due";
type ReminderStatus = "scheduled" | "sent" | "failed" | "cancelled";
type TemplateType =
  | "pre_due_soft"
  | "pre_due_strong"
  | "due_day"
  | "post_due_soft"
  | "post_due_strong";

type Reminder = {
  id: string;
  loanId: string;
  type: ReminderChannel;
  triggerType: ReminderTrigger;
  daysOffset?: number; // only needed for before_due / after_due
  templateType?: TemplateType;
  customMessage?: string;
  channelFallback?: ReminderChannel[];
  status: ReminderStatus;
  lastSentAt?: string | null;
  createdAt: string;
};

const reminders: Reminder[] = [];
let nextReminderId = 1;

// Helper: consistent error response shape
function badRequest(message: string, field?: string) {
  return {
    error: {
      code: "INVALID_INPUT",
      message,
      ...(field
        ? { details: [{ field, issue: message }] }
        : {}),
    },
  };
}

// ✅ POST /reminders -> schedule reminder
router.post("/", (req, res) => {
  const {
    loanId,
    type,
    triggerType,
    daysOffset,
    templateType,
    customMessage,
    channelFallback,
  } = req.body ?? {};

  if (!loanId) {
    return res.status(400).json(badRequest("loanId is required", "loanId"));
  }

  const allowedTypes: ReminderChannel[] = ["sms", "email", "whatsapp"];
  if (!type || !allowedTypes.includes(type)) {
    return res
      .status(400)
      .json(badRequest("type must be one of sms, email, whatsapp", "type"));
  }

  const allowedTriggers: ReminderTrigger[] = ["before_due", "on_due", "after_due"];
  if (!triggerType || !allowedTriggers.includes(triggerType)) {
    return res
      .status(400)
      .json(
        badRequest(
          "triggerType must be one of before_due, on_due, after_due",
          "triggerType"
        )
      );
  }

  // ✅ Align logic for on_due vs before/after
  if (triggerType === "before_due" || triggerType === "after_due") {
    if (daysOffset === undefined || daysOffset === null) {
      return res
        .status(400)
        .json(
          badRequest(
            "daysOffset is required when triggerType is before_due or after_due",
            "daysOffset"
          )
        );
    }

    const parsed = Number(daysOffset);
    if (!Number.isFinite(parsed) || parsed < 1) {
      return res
        .status(400)
        .json(badRequest("daysOffset must be a number >= 1", "daysOffset"));
    }
  }

  if (triggerType === "on_due") {
    // We ignore daysOffset if it was mistakenly sent
    // so the behavior stays consistent.
  }

  // Validate channelFallback (optional)
  if (channelFallback !== undefined) {
    if (!Array.isArray(channelFallback)) {
      return res
        .status(400)
        .json(badRequest("channelFallback must be an array", "channelFallback"));
    }
    for (const ch of channelFallback) {
      if (!allowedTypes.includes(ch)) {
        return res
          .status(400)
          .json(
            badRequest(
              "channelFallback can only contain sms, email, whatsapp",
              "channelFallback"
            )
          );
      }
    }
  }

  // Validate templateType (optional)
  const allowedTemplates: TemplateType[] = [
    "pre_due_soft",
    "pre_due_strong",
    "due_day",
    "post_due_soft",
    "post_due_strong",
  ];

  if (templateType !== undefined && templateType !== null) {
    if (!allowedTemplates.includes(templateType)) {
      return res
        .status(400)
        .json(
          badRequest(
            "templateType must be one of pre_due_soft, pre_due_strong, due_day, post_due_soft, post_due_strong",
            "templateType"
          )
        );
    }
  }

  const reminder: Reminder = {
    id: `rem_${nextReminderId++}`,
    loanId,
    type,
    triggerType,
    ...(triggerType === "before_due" || triggerType === "after_due"
      ? { daysOffset: Number(daysOffset) }
      : {}),
    ...(templateType ? { templateType } : {}),
    ...(customMessage ? { customMessage } : {}),
    ...(channelFallback ? { channelFallback } : {}),
    status: "scheduled",
    lastSentAt: null,
    createdAt: new Date().toISOString(),
  };

  reminders.push(reminder);

  return res.status(201).json(reminder);
});

// ✅ GET /reminders -> list reminders (supports page/pageSize + optional filters)
router.get("/", (req, res) => {
  const loanId = req.query.loanId ? String(req.query.loanId) : undefined;
  const status = req.query.status ? String(req.query.status) : undefined;

  let filtered = reminders;

  if (loanId) filtered = filtered.filter((r) => r.loanId === loanId);
  if (status) filtered = filtered.filter((r) => r.status === status);

  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 20);

  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safePageSize =
    Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20;

  const start = (safePage - 1) * safePageSize;
  const end = start + safePageSize;

  const data = filtered.slice(start, end);

  return res.json({
    data,
    total: filtered.length,
  });
});

// ✅ GET /reminders/:id -> get reminder by id
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const reminder = reminders.find((r) => r.id === id);

  if (!reminder) {
    return res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "Reminder not found.",
      },
    });
  }

  return res.json(reminder);
});

// ✅ POST /reminders/:id/test -> simulate test send
router.post("/:id/test", (req, res) => {
  const { id } = req.params;
  const reminder = reminders.find((r) => r.id === id);

  if (!reminder) {
    return res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "Reminder not found.",
      },
    });
  }

  // "Test send" simulation: mark as sent and set lastSentAt
  reminder.status = "sent";
  reminder.lastSentAt = new Date().toISOString();

  return res.json(reminder);
});

export default router;