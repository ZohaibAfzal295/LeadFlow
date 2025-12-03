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

    // Check if user exists
    const existingUser = await sql`
      SELECT id FROM "User" WHERE email = ${email}
    `;
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Validate clientId if provided
    if (clientId) {
      const client = await sql`
        SELECT id FROM "Client" WHERE id = ${clientId}
      `;
      if (client.length === 0) {
        return res.status(400).json({ message: "Client does not exist" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await sql`
      INSERT INTO "User" (email, password, role, "clientId")
      VALUES (${email}, ${hashedPassword}, ${role}, ${clientId})
      RETURNING id, email, role, "clientId", "createdAt"
    `;

    res.json({
      message: "User registered",
      user: newUser[0],
    });

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
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Include clientId in JWT payload for permissions
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      clientId: user.clientId, // 🔥 IMPORTANT: Admin can access only their client
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

res.json({
  success: true,
  message: "Login successful",
  token,
  user: {
    id: user.id,
    email: user.email,
    role: user.role,
    clientId: user.clientId
  }
});

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
