import { Router } from "express";

const router = Router();

type RepaymentStatus = "recorded" | "failed" | "reversed";
type RepaymentMethod =
  | "bank_transfer"
  | "card"
  | "wallet"
  | "cash"
  | "ussd"
  | "direct_debit"
  | "other";

type Repayment = {
  id: string;
  loanId: string;
  borrowerId: string;
  amount: number;
  currency: string;
  paidAt: string;
  method?: RepaymentMethod;
  reference?: string | null;
  status: RepaymentStatus;
  failureReason?: string | null;
  createdAt: string;
};

// In-memory store (for now)
const repayments: Repayment[] = [];
let nextRepaymentId = 1;

// Helper error response shape
function badRequest(message: string, field?: string) {
  return {
    error: {
      code: "INVALID_INPUT",
      message,
      ...(field ? { details: [{ field, issue: message }] } : {}),
    },
  };
}

function notFound(message: string) {
  return {
    error: {
      code: "NOT_FOUND",
      message,
    },
  };
}

// ✅ POST /repayments -> create repayment
router.post("/", (req, res) => {
  const { loanId, borrowerId, amount, currency, paidAt, method, reference } =
    req.body ?? {};

  if (!loanId) return res.status(400).json(badRequest("loanId is required", "loanId"));
  if (!borrowerId)
    return res.status(400).json(badRequest("borrowerId is required", "borrowerId"));

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return res
      .status(400)
      .json(badRequest("amount must be a number > 0", "amount"));
  }

  if (!currency) return res.status(400).json(badRequest("currency is required", "currency"));
  if (!paidAt) return res.status(400).json(badRequest("paidAt is required", "paidAt"));

  // Method validation (optional)
  const allowedMethods: RepaymentMethod[] = [
    "bank_transfer",
    "card",
    "wallet",
    "cash",
    "ussd",
    "direct_debit",
    "other",
  ];

  if (method !== undefined && method !== null && !allowedMethods.includes(method)) {
    return res
      .status(400)
      .json(badRequest("method is invalid", "method"));
  }

  const repayment: Repayment = {
    id: `rep_${nextRepaymentId++}`,
    loanId,
    borrowerId,
    amount: parsedAmount,
    currency,
    paidAt,
    ...(method ? { method } : {}),
    ...(reference !== undefined ? { reference } : {}),
    status: "recorded",
    failureReason: null,
    createdAt: new Date().toISOString(),
  };

  repayments.push(repayment);

  return res.status(201).json(repayment);
});

// ✅ GET /repayments -> list repayments (filters + pagination)
router.get("/", (req, res) => {
  const loanId = req.query.loanId ? String(req.query.loanId) : undefined;
  const borrowerId = req.query.borrowerId ? String(req.query.borrowerId) : undefined;
  const status = req.query.status ? String(req.query.status) : undefined;

  let filtered = repayments;

  if (loanId) filtered = filtered.filter((r) => r.loanId === loanId);
  if (borrowerId) filtered = filtered.filter((r) => r.borrowerId === borrowerId);
  if (status) filtered = filtered.filter((r) => r.status === status);

  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 20);

  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20;

  const start = (safePage - 1) * safePageSize;
  const end = start + safePageSize;

  return res.json({
    data: filtered.slice(start, end),
    total: filtered.length,
  });
});

// ✅ GET /repayments/:id -> get repayment
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const repayment = repayments.find((r) => r.id === id);

  if (!repayment) return res.status(404).json(notFound("Repayment not found."));

  return res.json(repayment);
});

export default router;