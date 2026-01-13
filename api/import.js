import { getDb, getUserFromRequest } from "./db.js";

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sql = getDb();

  try {
    // Get authenticated user
    const user = await getUserFromRequest(req);

    // Get import data from request body
    const { version, projects, tasks } = req.body;

    // Server-side validation
    if (!version || version !== "1.0") {
      return res.status(400).json({
        error: "Invalid or unsupported import version"
      });
    }

    if (!Array.isArray(projects) || !Array.isArray(tasks)) {
      return res.status(400).json({
        error: "Invalid import data structure"
      });
    }

    // Step 1: Delete all existing user data
    // (Tasks cascade deleted with projects)
    await sql`DELETE FROM projects WHERE user_id = ${user.id}`;

    // Step 2: Import projects and build ID mapping
    const projectIdMap = {};

    for (const project of projects) {
      const result = await sql`
        INSERT INTO projects (user_id, name, title, color, date)
        VALUES (
          ${user.id},
          ${project.name},
          ${project.title},
          ${project.color},
          ${project.date || new Date().toISOString()}
        )
        RETURNING id
      `;

      projectIdMap[project.id] = result[0].id;
    }

    // Step 3: Import tasks with remapped project IDs
    for (const task of tasks) {
      const newProjectId = task.projectId ? projectIdMap[task.projectId] : null;

      await sql`
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
          ${newProjectId},
          ${task.title},
          ${task.description || ""},
          ${task.date},
          ${task.startTime || task.start_time || null},
          ${task.endTime || task.end_time || null},
          ${task.status || "pending"},
          ${task.tags || []},
          ${task.categories || []},
          ${task.priority || "medium"}
        )
      `;
    }

    return res.status(200).json({
      success: true,
      message: "Data imported successfully",
      projectsCount: projects.length,
      tasksCount: tasks.length,
    });

  } catch (error) {
    console.error("Import error:", error);
    return res.status(500).json({
      error: "Failed to import data: " + error.message
    });
  }
}
