import { neon } from '@neondatabase/serverless';

// Create a single connection pool
let sql;

export function getDb() {
  if (!sql) {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    sql = neon(databaseUrl);
  }

  return sql;
}

// Helper function to get user ID from session/auth
// For now, we'll use a simple approach with user email
// You can replace this with proper authentication later
export function getUserIdFromRequest(req) {
  // For now, we'll use a header or query parameter
  // In production, this should be from a JWT or session
  const userEmail = req.headers['x-user-email'] || req.query.userEmail;

  if (!userEmail) {
    throw new Error('User email not provided');
  }

  return userEmail;
}

// Helper to ensure user exists and return user ID
export async function ensureUser(email, name = null) {
  const sql = getDb();

  // Try to find existing user
  const users = await sql`
    SELECT id, name, email FROM users WHERE email = ${email}
  `;

  if (users.length > 0) {
    return users[0];
  }

  // Create new user if doesn't exist
  const newUsers = await sql`
    INSERT INTO users (email, name)
    VALUES (${email}, ${name || email.split('@')[0]})
    RETURNING id, name, email
  `;

  return newUsers[0];
}
