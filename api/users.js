import { getDb, getUserFromRequest } from "./db.js";

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

  try {
    // Get authenticated user from cookie
    const user = await getUserFromRequest(req);

    // PUT /api/users - Update user name and/or profile picture
    if (req.method === "PUT") {
      const { name, profile_picture } = req.body;

      if (!name && profile_picture === undefined) {
        return res.status(400).json({ error: "Name or profile_picture is required" });
      }

      // Build dynamic update query
      let updateFields = [];
      let values = {};

      if (name) {
        updateFields.push('name');
        values.name = name;
      }

      if (profile_picture !== undefined) {
        updateFields.push('profile_picture');
        values.profile_picture = profile_picture;
      }

      // Construct the SQL query dynamically
      const result = await sql`
        UPDATE users
        SET ${sql(values)}
        WHERE id = ${user.id}
        RETURNING id, name, email, profile_picture
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json(result[0]);
    }

    // DELETE /api/users - Delete user and all data
    if (req.method === "DELETE") {
      // Delete user (cascades to projects and tasks)
      await sql`DELETE FROM users WHERE id = ${user.id}`;

      // Clear auth cookie
      res.setHeader(
        "Set-Cookie",
        "auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax"
      );

      return res.status(200).json({ message: "User deleted successfully" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
