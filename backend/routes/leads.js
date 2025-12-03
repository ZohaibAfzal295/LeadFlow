// routes/leads.js
import express from "express";
import sql from "../db/index.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET all leads for current user's client
router.get("/", authMiddleware, async (req, res) => {
  try {
    const leads = await sql`
      SELECT * FROM "Lead" WHERE "clientId" = ${req.user.clientId}
    `;
    res.json({ success: true, leads });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
