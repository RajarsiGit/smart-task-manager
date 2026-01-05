import { getDb } from "./db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// JWT secret - in production, use environment variable
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const COOKIE_NAME = "auth_token";

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const sql = getDb();

  // Extract path from URL - handle Vercel routing
  let path = "";
  if (req.query?.path) {
    path = Array.isArray(req.query.path) ? req.query.path[0] : req.query.path;
  } else if (req.url) {
    // Parse from URL for dev server
    const urlMatch = req.url.match(/\/api\/auth\/?(.*)$/);
    if (urlMatch?.[1]) {
      path = urlMatch[1].split("?")[0];
    }
  }

  try {
    // POST /api/auth - Register new user
    if (req.method === "POST" && !path) {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res
          .status(400)
          .json({ error: "Name, email, and password are required" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      // Validate password length
      if (password.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters" });
      }

      // Check if user already exists
      const existingUser = await sql`
        SELECT id FROM users WHERE email = ${email}
      `;

      if (existingUser.length > 0) {
        return res
          .status(409)
          .json({ error: "User with this email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const result = await sql`
        INSERT INTO users (name, email, password)
        VALUES (${name}, ${email}, ${hashedPassword})
        RETURNING id, name, email, created_at
      `;

      const user = result[0];

      // Create JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Set httpOnly cookie
      res.setHeader(
        "Set-Cookie",
        `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${
          60 * 60
        }; SameSite=Lax`
      );

      return res.status(201).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    }

    // POST /api/auth/login - Login user
    if (req.method === "POST" && path === "login") {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      // Find user
      const result = await sql`
        SELECT id, name, email, password FROM users
        WHERE email = ${email}
      `;

      if (result.length === 0) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const user = result[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Create JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Set httpOnly cookie
      res.setHeader(
        "Set-Cookie",
        `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${
          60 * 60
        }; SameSite=Lax`
      );

      return res.status(200).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    }

    // POST /api/auth/logout - Logout user
    if (req.method === "POST" && path === "logout") {
      // Clear cookie
      res.setHeader(
        "Set-Cookie",
        `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
      );

      return res.status(200).json({ message: "Logged out successfully" });
    }

    // GET /api/auth/me - Get current user
    if (req.method === "GET" && path === "me") {
      // Get token from cookie
      const cookies =
        req.headers.cookie?.split(";").reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split("=");
          acc[key] = value;
          return acc;
        }, {}) || {};

      const token = cookies[COOKIE_NAME];

      if (!token) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Get user
        const result = await sql`
          SELECT id, name, email, created_at FROM users
          WHERE id = ${decoded.userId}
        `;

        if (result.length === 0) {
          return res.status(401).json({ error: "User not found" });
        }

        return res.status(200).json({ user: result[0] });
      } catch {
        return res.status(401).json({ error: "Invalid or expired token" });
      }
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Auth API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// Middleware to verify JWT from cookie
export function verifyAuth(req) {
  const cookies =
    req.headers.cookie?.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    }, {}) || {};

  const token = cookies[COOKIE_NAME];

  if (!token) {
    throw new Error("Not authenticated");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch {
    throw new Error("Invalid or expired token");
  }
}
