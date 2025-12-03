// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

// ------------------ BASE AUTH ------------------
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Store user in req
    // decoded contains: { id, email, role, clientId }
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ------------------ ROLE CHECKER ------------------
export const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }
    next();
  };
};

// ------------------ CLIENT SCOPING ------------------
export const requireClientAccess = (clientIdField = "clientId") => {
  return (req, res, next) => {
    const userClientId = req.user.clientId;
    const targetClientId = req.params[clientIdField] || req.body[clientIdField];

    if (!targetClientId) {
      return res.status(400).json({ message: "Missing clientId" });
    }

    if (Number(userClientId) !== Number(targetClientId)) {
      return res.status(403).json({ message: "You cannot access another client's data" });
    }

    next();
  };
};
