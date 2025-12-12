import { Router } from "express";

const router = Router();

// 🔹 Types
type LoanStatus = "pending" | "active" | "completed" | "defaulted";

type Loan = {
  id: string;
  borrowerId: string;
  principal: number;
  currency: string;
  status: LoanStatus;
  createdAt: string;
  dueDate?: string;
};

// 🔹 Temporary in-memory store (for local dev only)
const loans: Loan[] = [];
let nextLoanId = 1;

// POST /loans  -> create a loan
router.post("/", (req, res) => {
  const { borrowerId, principal, currency = "NGN", dueDate } = req.body;

  if (!borrowerId || !principal || !currency) {
    return res.status(400).json({
      error: {
        code: "INVALID_INPUT",
        message: "borrowerId, principal and currency are required",
      },
    });
  }

  const numericprincipal = Number(principal);

  if (!numericprincipal || numericprincipal<= 0) {
    return res.status(400).json({
      error: {
        code: "INVALID_INPUT",
        message: "amount must be a positive number",
      },
    });
  }

  const loan: Loan = {
    id: `loan_${nextLoanId++}`,
    borrowerId,
    principal: Number(principal),
    currency,
    status: "pending",
    createdAt: new Date().toISOString(),
    ...(dueDate? { dueDate } : {}),
  };

  loans.push(loan);

  return res.status(201).json(loan);
});

// GET /loans  -> list all loans
router.get("/", (_req, res) => {
  res.json({
    data: loans,
    total: loans.length,
  });
});

// GET /loans/:id  -> get a single loan
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const loan = loans.find((l) => l.id === id);

  if (!loan) {
    return res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "Loan not found.",
      },
    });
  }

  return res.json(loan);
});

export default router;