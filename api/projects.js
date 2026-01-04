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

    // GET /api/projects - Get all projects for user
    if (req.method === "GET") {
      const { id } = req.query;

      if (id) {
        // Get single project
        const result = await sql`
          SELECT * FROM projects
          WHERE id = ${id} AND user_id = ${user.id}
        `;

        if (result.length === 0) {
          return res.status(404).json({ error: "Project not found" });
        }

        return res.status(200).json(result[0]);
      }

      // Get all projects
      const projects = await sql`
        SELECT * FROM projects
        WHERE user_id = ${user.id}
        ORDER BY created_at DESC
      `;

      return res.status(200).json(projects);
    }

    // POST /api/projects - Create new project
    if (req.method === "POST") {
      const { name, title, color } = req.body;

      if (!name || !title || !color) {
        return res
          .status(400)
          .json({ error: "Missing required fields: name, title, color" });
      }

      const result = await sql`
        INSERT INTO projects (user_id, name, title, color)
        VALUES (${user.id}, ${name}, ${title}, ${color})
        RETURNING *
      `;

      return res.status(201).json(result[0]);
    }

    // PUT /api/projects - Update project
    if (req.method === "PUT") {
      const { id, name, title, color } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Project ID is required" });
      }

      const result = await sql`
        UPDATE projects
        SET
          name = COALESCE(${name}, name),
          title = COALESCE(${title}, title),
          color = COALESCE(${color}, color)
        WHERE id = ${id} AND user_id = ${user.id}
        RETURNING *
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: "Project not found" });
      }

      return res.status(200).json(result[0]);
    }

    // DELETE /api/projects - Delete project
    if (req.method === "DELETE") {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: "Project ID is required" });
      }

      // Tasks will be deleted automatically via CASCADE
      const result = await sql`
        DELETE FROM projects
        WHERE id = ${id} AND user_id = ${user.id}
        RETURNING id
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: "Project not found" });
      }

      return res
        .status(200)
        .json({ message: "Project deleted successfully", id: result[0].id });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
