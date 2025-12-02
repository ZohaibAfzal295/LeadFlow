// routes/auth.js
import express from "express";
import sql from "../db/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// REGISTER ROUTE
router.post("/register", async (req, res) => {
  const { email, password, role, clientId } = req.body;
  try {
    const exists = await sql`SELECT * FROM "User" WHERE email = ${email}`;
    if (exists.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await sql`
      INSERT INTO "User" (email, password, role, "clientId")
      VALUES (${email}, ${hashedPassword}, ${role}, ${clientId})
      RETURNING id, email, role, "clientId";
    `;

    return res.json({
      success: true,
      message: "User registered successfully",
      user: user[0]
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// LOGIN ROUTE
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const users = await sql`SELECT * FROM "User" WHERE email = ${email}`;
    if (users.length === 0) return res.status(400).json({ error: "User not found" });

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Incorrect password" });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    return res.json({ success: true, message: "Login successful", token });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/list", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;

  // Example
  res.json({ message: "Protected route works!", userId, role });
});


export default router;
