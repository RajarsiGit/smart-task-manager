// API utility for connecting to Vercel serverless functions

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// Generic fetch wrapper with error handling
async function apiFetch(endpoint, options = {}) {
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  const config = {
    ...options,
    credentials: "include", // Important: Send cookies with requests
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// ============ AUTH API ============

export const authApi = {
  // Register new user
  register: async (name, email, password) => {
    return apiFetch("/auth", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },

  // Login user
  login: async (email, password) => {
    return apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  // Logout user
  logout: async () => {
    return apiFetch("/auth/logout", {
      method: "POST",
    });
  },

  // Get current user
  getCurrentUser: async () => {
    return apiFetch("/auth/me");
  },
};

// ============ USER API ============

export const userApi = {
  // Update user name
  updateUser: async (name) => {
    return apiFetch("/users", {
      method: "PUT",
      body: JSON.stringify({ name }),
    });
  },

  // Delete user account
  deleteUser: async () => {
    return apiFetch("/users", {
      method: "DELETE",
    });
  },
};

// ============ PROJECTS API ============

export const projectsApi = {
  // Get all projects
  getAll: async () => {
    return apiFetch("/projects");
  },

  // Get single project
  getById: async (id) => {
    return apiFetch(`/projects?id=${id}`);
  },

  // Create project
  create: async (projectData) => {
    return apiFetch("/projects", {
      method: "POST",
      body: JSON.stringify(projectData),
    });
  },

  // Update project
  update: async (id, projectData) => {
    return apiFetch("/projects", {
      method: "PUT",
      body: JSON.stringify({ id, ...projectData }),
    });
  },

  // Delete project
  delete: async (id) => {
    return apiFetch(`/projects?id=${id}`, {
      method: "DELETE",
    });
  },
};

// ============ TASKS API ============

export const tasksApi = {
  // Get all tasks (with optional filters)
  getAll: async (filters = {}) => {
    const query = new URLSearchParams(filters);
    const queryString = query.toString() ? `?${query}` : "";
    return apiFetch(`/tasks${queryString}`);
  },

  // Get single task
  getById: async (id) => {
    return apiFetch(`/tasks?id=${id}`);
  },

  // Get tasks by project
  getByProject: async (projectId) => {
    return apiFetch(`/tasks?projectId=${projectId}`);
  },

  // Get tasks by date
  getByDate: async (date) => {
    return apiFetch(`/tasks?date=${date}`);
  },

  // Get tasks by status
  getByStatus: async (status) => {
    return apiFetch(`/tasks?status=${status}`);
  },

  // Create task
  create: async (taskData) => {
    return apiFetch("/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    });
  },

  // Update task
  update: async (id, taskData) => {
    return apiFetch("/tasks", {
      method: "PUT",
      body: JSON.stringify({ id, ...taskData }),
    });
  },

  // Delete task
  delete: async (id) => {
    return apiFetch(`/tasks?id=${id}`, {
      method: "DELETE",
    });
  },
};

// ============ MIGRATION HELPER ============

// Migrate localStorage data to database
export async function migrateLocalStorageToDb() {
  try {
    // Get data from localStorage
    const projectsData = localStorage.getItem("taskManager_projects");
    const tasksData = localStorage.getItem("taskManager_tasks");
    const userData = localStorage.getItem("taskManager_user");

    if (!userData) {
      throw new Error("No user data found in localStorage");
    }

    const user = JSON.parse(userData);
    const projects = projectsData ? JSON.parse(projectsData) : [];
    const tasks = tasksData ? JSON.parse(tasksData) : [];

    // Ensure user exists in database
    await userApi.getUser(user.email || "user@example.com", user.name);

    // Map to track old project IDs to new ones
    const projectIdMap = {};

    // Migrate projects
    for (const project of projects) {
      const { id, ...projectData } = project;
      const newProject = await projectsApi.create(projectData);
      projectIdMap[id] = newProject.id;
    }

    // Migrate tasks with updated project IDs
    for (const task of tasks) {
      const { id, projectId, ...taskData } = task;
      const newProjectId = projectId ? projectIdMap[projectId] : null;

      await tasksApi.create({
        ...taskData,
        projectId: newProjectId,
      });
    }

    return {
      success: true,
      migratedProjects: projects.length,
      migratedTasks: tasks.length,
    };
  } catch (error) {
    console.error("Migration error:", error);
    throw error;
  }
}
