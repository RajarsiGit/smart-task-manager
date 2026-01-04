import { getDb, ensureUser } from './db.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-email');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sql = getDb();

  try {
    // GET /api/users - Get or create user
    if (req.method === 'GET') {
      const { email, name } = req.query;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const user = await ensureUser(email, name);
      return res.status(200).json(user);
    }

    // PUT /api/users - Update user name
    if (req.method === 'PUT') {
      const { email, name } = req.body;

      if (!email || !name) {
        return res.status(400).json({ error: 'Email and name are required' });
      }

      const result = await sql`
        UPDATE users
        SET name = ${name}
        WHERE email = ${email}
        RETURNING id, name, email
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json(result[0]);
    }

    // DELETE /api/users - Delete user and all data
    if (req.method === 'DELETE') {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      await sql`DELETE FROM users WHERE email = ${email}`;

      return res.status(200).json({ message: 'User deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
