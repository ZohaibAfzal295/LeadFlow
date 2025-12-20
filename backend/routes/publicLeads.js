import express from "express";
import sql from "../db/index.js";

const router = express.Router();

// ------------------ PUBLIC LEAD SUBMIT ------------------
router.post("/submit", async (req, res) => {
  try {
    const {
      clientId,
      name,
      email,
      phone,
      message,
      source,
      custom
    } = req.body;

    // 🔴 Basic validation
    if (!clientId || !name) {
      return res.status(400).json({
        success: false,
        message: "clientId and name are required"
      });
    }

    // 🔴 Check if client exists
    const client = await sql`
      SELECT id FROM "Client" WHERE id = ${clientId}
    `;

    if (client.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid clientId"
      });
    }

    // ✅ Insert lead
    const lead = await sql`
      INSERT INTO "Lead"
      ("clientId", name, email, phone, message, source, custom)
      VALUES
      (${clientId}, ${name}, ${email}, ${phone}, ${message}, ${source}, ${custom})
      RETURNING *;
    `;

    res.json({
      success: true,
      message: "Lead submitted successfully",
      lead: lead[0]
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default router;
