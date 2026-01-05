import { neon } from "@neondatabase/serverless";
import jwt from "jsonwebtoken";

// Create a single connection pool
let sql;

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const COOKIE_NAME = "auth_token";

export function getDb() {
  if (!sql) {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    sql = neon(databaseUrl);
  }

  return sql;
}

// Helper function to get user from JWT cookie
export async function getUserFromRequest(req) {
  const sql = getDb();

  // Get cookies from request
  const cookies =
    req.headers.cookie?.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    }, {}) || {};

  const token = cookies[COOKIE_NAME];

  if (!token) {
    throw new Error("Not authenticated - no token found");
  }

  try {
    // Verify and decode JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from database
    const users = await sql`
      SELECT id, name, email, profile_picture FROM users WHERE id = ${decoded.userId}
    `;

    if (users.length === 0) {
      throw new Error("User not found");
    }

    return users[0];
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      throw new Error("Invalid or expired token");
    }
    throw error;
  }
}

// Legacy function - kept for backwards compatibility
// This is no longer used with cookie auth but keeping for migration
export async function ensureUser(email, name = null) {
  const sql = getDb();

  // Try to find existing user
  const users = await sql`
    SELECT id, name, email, profile_picture FROM users WHERE email = ${email}
  `;

  if (users.length > 0) {
    return users[0];
  }

  // Create new user if doesn't exist
  const newUsers = await sql`
    INSERT INTO users (email, name, password)
    VALUES (${email}, ${name || email.split("@")[0]}, '')
    RETURNING id, name, email, profile_picture
  `;

  return newUsers[0];
}
