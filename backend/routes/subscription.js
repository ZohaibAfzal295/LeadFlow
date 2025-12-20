// routes/subscription.js
import express from "express";
import sql from "../db/index.js";
import { authMiddleware, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /subscription/update
router.post("/update", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const { plan, status, renewDate, stripeSubId } = req.body;

    if (!plan && !status && !renewDate && !stripeSubId) {
      return res.status(400).json({ error: "At least one field must be provided" });
    }

    // Build an array of assignments
    const assignments = [];
    if (plan) assignments.push(sql`plan = ${plan}`);
    if (status) assignments.push(sql`status = ${status}`);
    if (renewDate) assignments.push(sql`"renewDate" = ${renewDate}`);
    if (stripeSubId) assignments.push(sql`"stripeSubId" = ${stripeSubId}`);

    // Join assignments with commas
    await sql`
      UPDATE "Subscription"
      SET ${sql.join(assignments, sql`, `)}
      WHERE "clientId" = ${req.user.clientId};
    `;

    res.json({ success: true, message: "Subscription updated!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
