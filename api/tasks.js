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

    // GET /api/tasks - Get all tasks for user
    if (req.method === "GET") {
      const { id, projectId, date, status } = req.query;

      if (id) {
        // Get single task
        const result = await sql`
          SELECT * FROM tasks
          WHERE id = ${id} AND user_id = ${user.id}
        `;

        if (result.length === 0) {
          return res.status(404).json({ error: "Task not found" });
        }

        return res.status(200).json(result[0]);
      }

      // Build query with filters
      let query = sql`SELECT * FROM tasks WHERE user_id = ${user.id}`;

      if (projectId) {
        query = sql`SELECT * FROM tasks WHERE user_id = ${user.id} AND project_id = ${projectId}`;
      }

      if (date) {
        query = sql`SELECT * FROM tasks WHERE user_id = ${user.id} AND DATE(date) = DATE(${date})`;
      }

      if (status) {
        query = sql`SELECT * FROM tasks WHERE user_id = ${user.id} AND status = ${status}`;
      }

      const tasks = await query;

      return res.status(200).json(tasks);
    }

    // POST /api/tasks - Create new task
    if (req.method === "POST") {
      const {
        title,
        description,
        date,
        startTime,
        endTime,
        projectId,
        tags,
        categories,
        status,
        priority,
      } = req.body;

      if (!title || !date) {
        return res.status(400).json({ error: "Title and date are required" });
      }

      const result = await sql`
        INSERT INTO tasks (
          user_id,
          project_id,
          title,
          description,
          date,
          start_time,
          end_time,
          status,
          tags,
          categories,
          priority
        )
        VALUES (
          ${user.id},
          ${projectId || null},
          ${title},
          ${description || ""},
          ${date},
          ${startTime || null},
          ${endTime || null},
          ${status || "pending"},
          ${tags || []},
          ${categories || []},
          ${priority || "medium"}
        )
        RETURNING *
      `;

      return res.status(201).json(result[0]);
    }

    // PUT /api/tasks - Update task
    if (req.method === "PUT") {
      const {
        id,
        title,
        description,
        date,
        startTime,
        endTime,
        projectId,
        tags,
        categories,
        status,
        priority,
      } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Task ID is required" });
      }

      const result = await sql`
        UPDATE tasks
        SET
          title = COALESCE(${title}, title),
          description = COALESCE(${description}, description),
          date = COALESCE(${date}, date),
          start_time = COALESCE(${startTime}, start_time),
          end_time = COALESCE(${endTime}, end_time),
          project_id = COALESCE(${projectId}, project_id),
          status = COALESCE(${status}, status),
          tags = COALESCE(${tags}, tags),
          categories = COALESCE(${categories}, categories),
          priority = COALESCE(${priority}, priority)
        WHERE id = ${id} AND user_id = ${user.id}
        RETURNING *
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: "Task not found" });
      }

      return res.status(200).json(result[0]);
    }

    // DELETE /api/tasks - Delete task
    if (req.method === "DELETE") {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: "Task ID is required" });
      }

      const result = await sql`
        DELETE FROM tasks
        WHERE id = ${id} AND user_id = ${user.id}
        RETURNING id
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: "Task not found" });
      }

      return res
        .status(200)
        .json({ message: "Task deleted successfully", id: result[0].id });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
