import express from "express";
import sql from "../db/index.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ------------------ GET LEADS ------------------
router.get("/", authMiddleware, async (req, res) => {
  try {
    const leads = await sql`
      SELECT * FROM "Lead"
      WHERE "clientId" = ${req.user.clientId}
    `;
    res.json({ success: true, leads });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ------------------ CREATE LEAD ------------------
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, message, source, custom } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const lead = await sql`
      INSERT INTO "Lead"
      ("clientId", name, email, phone, message, source, custom)
      VALUES
      (${req.user.clientId}, ${name}, ${email}, ${phone}, ${message}, ${source}, ${custom})
      RETURNING *;
    `;

    res.json({
      success: true,
      message: "Lead submitted successfully",
      lead: lead[0]
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
