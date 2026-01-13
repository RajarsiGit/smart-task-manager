const STORAGE_KEYS = {
  PROJECTS: "taskManager_projects",
  TASKS: "taskManager_tasks",
  USER: "taskManager_user",
};

// Initialize with empty data if not present
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([]));
  }

  // Don't auto-initialize user - let WelcomeScreen handle it
};

// Projects
export const getProjects = () => {
  initializeStorage();
  const projects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  return projects ? JSON.parse(projects) : [];
};

export const addProject = (project) => {
  const projects = getProjects();
  const newProject = {
    ...project,
    id: Date.now(),
    date: new Date().toISOString(),
  };
  projects.push(newProject);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  return newProject;
};

export const updateProject = (id, updates) => {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index !== -1) {
    projects[index] = { ...projects[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    return projects[index];
  }
  return null;
};

export const deleteProject = (id) => {
  const projects = getProjects();
  const filtered = projects.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));

  // Also delete associated tasks
  const tasks = getTasks();
  const filteredTasks = tasks.filter((t) => t.projectId !== id);
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(filteredTasks));
};

// Tasks
export const getTasks = () => {
  initializeStorage();
  const tasks = localStorage.getItem(STORAGE_KEYS.TASKS);
  return tasks ? JSON.parse(tasks) : [];
};

export const getTaskById = (id) => {
  const tasks = getTasks();
  return tasks.find((t) => t.id === Number.parseInt(id));
};

export const getTasksByDate = (date) => {
  const tasks = getTasks();
  return tasks.filter((task) => {
    const taskDate = new Date(task.date).toDateString();
    const searchDate = new Date(date).toDateString();
    return taskDate === searchDate;
  });
};

export const getTasksByProject = (projectId) => {
  const tasks = getTasks();
  return tasks.filter((t) => t.projectId === projectId);
};

export const addTask = (task) => {
  const tasks = getTasks();
  const newTask = {
    ...task,
    id: Date.now(),
    date: task.date || new Date().toISOString(),
    status: task.status || "pending",
    priority: task.priority || "medium",
  };
  tasks.push(newTask);
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  return newTask;
};

export const updateTask = (id, updates) => {
  const tasks = getTasks();
  const index = tasks.findIndex((t) => t.id === Number.parseInt(id));
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    return tasks[index];
  }
  return null;
};

export const deleteTask = (id) => {
  const tasks = getTasks();
  const filtered = tasks.filter((t) => t.id !== Number.parseInt(id));
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(filtered));
};

// User
export const getUser = () => {
  initializeStorage();
  const user = localStorage.getItem(STORAGE_KEYS.USER);
  return user ? JSON.parse(user) : null;
};

export const updateUser = (userData) => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
};

// Import data (replace all existing data)
export const importData = (data) => {
  // Clear existing data first
  clearAllData();

  // Import user data
  if (data.user) {
    const user = {
      name: data.user.name,
      email: data.user.email || 'user@example.com',
    };
    updateUser(user);
  }

  // Import projects with ID remapping
  const projectIdMap = {};

  for (const project of data.projects) {
    const newProject = addProject({
      name: project.name,
      title: project.title,
      color: project.color,
      date: project.date,
    });
    projectIdMap[project.id] = newProject.id;
  }

  // Import tasks with remapped project IDs
  for (const task of data.tasks) {
    const newProjectId = task.projectId ? projectIdMap[task.projectId] : null;

    addTask({
      title: task.title,
      description: task.description || '',
      date: task.date,
      startTime: task.startTime || null,
      endTime: task.endTime || null,
      status: task.status || 'pending',
      tags: task.tags || [],
      categories: task.categories || [],
      priority: task.priority || 'medium',
      projectId: newProjectId,
    });
  }

  return {
    success: true,
    projectsCount: data.projects.length,
    tasksCount: data.tasks.length,
  };
};

// Clear all data
export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.PROJECTS);
  localStorage.removeItem(STORAGE_KEYS.TASKS);
  localStorage.removeItem(STORAGE_KEYS.USER);
};
