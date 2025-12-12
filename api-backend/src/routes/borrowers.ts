import { Router } from "express";

const router = Router();

// 🔹 Temporary in-memory store (just for local dev)
type Borrower = {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  status: "active" | "inactive";
  createdAt: string;
};

const borrowers: Borrower[] = [];
let nextId = 1;

// POST /borrowers  -> create a borrower
router.post("/", (req, res) => {
  const { fullName, email, phone } = req.body;

  if (!fullName) {
    return res.status(400).json({
      error: {
        code: "INVALID_INPUT",
        message: "fullName is required",
      },
    });
  }

  const borrower: Borrower = {
    id: `bor_${nextId++}`,
    fullName,
    email,
    phone,
    status: "active",
    createdAt: new Date().toISOString(),
  };

  borrowers.push(borrower);

  res.status(201).json(borrower);
});

// GET /borrowers  -> list all borrowers
router.get("/", (_req, res) => {
  res.json({
    data: borrowers,
    total: borrowers.length,
  });
});

// GET /borrowers/:id  -> get one borrower
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const borrower = borrowers.find((b) => b.id === id);

  if (!borrower) {
    return res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "Borrower not found.",
      },
    });
  }

  res.json(borrower);
});

export default router;