// controllers/authController.js
import sql from "../db/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ------------------ REGISTER ------------------
export const register = async (req, res) => {
  try {
    const { email, password, role, clientId } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const existingUser = await sql`
      SELECT * FROM "User" WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await sql`
      INSERT INTO "User" (email, password, role, "clientId")
      VALUES (${email}, ${hashedPassword}, ${role}, ${clientId})
      RETURNING *
    `;

    res.json({ message: "User registered", user: newUser[0] });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------ LOGIN ------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const users = await sql`
      SELECT * FROM "User" WHERE email = ${email}
    `;

    if (users.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    // JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Login successful", token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
