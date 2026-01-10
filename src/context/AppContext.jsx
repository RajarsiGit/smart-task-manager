import { createContext, useContext, useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { authApi, userApi, projectsApi, tasksApi } from "../utils/api";
import * as storage from "../utils/localStorage";

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if we should use API or localStorage
  const useApi = Boolean(import.meta.env.VITE_USE_API !== "false");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (useApi) {
        try {
          // Get authenticated user from cookie
          const response = await authApi.getCurrentUser();
          const authenticatedUser = response.user;

          setUser(authenticatedUser);

          // Fetch projects and tasks from API
          const [projectsData, tasksData] = await Promise.all([
            projectsApi.getAll(),
            tasksApi.getAll(),
          ]);

          setProjects(projectsData);
          setTasks(tasksData);
        } catch (apiError) {
          // User not authenticated - they'll see the login screen
          setUser(null);
          setProjects([]);
          setTasks([]);
        }
      } else {
        // Load from localStorage only
        setProjects(storage.getProjects());
        setTasks(storage.getTasks());
        setUser(storage.getUser());
      }
    } catch (err) {
      setError(err.message);
      setUser(null);
      setProjects([]);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Project operations
  const createProject = async (projectData) => {
    try {
      if (useApi && user) {
        const newProject = await projectsApi.create(projectData);
        setProjects((prev) => [...prev, newProject]);
        return newProject;
      } else {
        const newProject = storage.addProject(projectData);
        setProjects((prev) => [...prev, newProject]);
        return newProject;
      }
    } catch (err) {
      throw err;
    }
  };

  const editProject = async (id, updates) => {
    try {
      if (useApi && user) {
        const updated = await projectsApi.update(id, updates);
        setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
        return updated;
      } else {
        const updated = storage.updateProject(id, updates);
        if (updated) {
          setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
        }
        return updated;
      }
    } catch (err) {
      throw err;
    }
  };

  const removeProject = async (id) => {
    try {
      if (useApi && user) {
        await projectsApi.delete(id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
        setTasks((prev) =>
          prev.filter((t) => t.project_id !== id && t.projectId !== id)
        );
      } else {
        storage.deleteProject(id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
        setTasks((prev) => prev.filter((t) => t.projectId !== id));
      }
    } catch (err) {
      throw err;
    }
  };

  // Task operations
  const createTask = async (taskData) => {
    try {
      if (useApi && user) {
        const newTask = await tasksApi.create(taskData);
        setTasks((prev) => [...prev, newTask]);
        return newTask;
      } else {
        const newTask = storage.addTask(taskData);
        setTasks((prev) => [...prev, newTask]);
        return newTask;
      }
    } catch (err) {
      throw err;
    }
  };

  const editTask = async (id, updates) => {
    try {
      if (useApi && user) {
        const updated = await tasksApi.update(id, updates);
        setTasks((prev) =>
          prev.map((t) => (t.id === Number.parseInt(id) ? updated : t))
        );
        return updated;
      } else {
        const updated = storage.updateTask(id, updates);
        if (updated) {
          setTasks((prev) =>
            prev.map((t) => (t.id === Number.parseInt(id) ? updated : t))
          );
        }
        return updated;
      }
    } catch (err) {
      throw err;
    }
  };

  const removeTask = async (id) => {
    try {
      if (useApi && user) {
        await tasksApi.delete(id);
        setTasks((prev) => prev.filter((t) => t.id !== Number.parseInt(id)));
      } else {
        storage.deleteTask(id);
        setTasks((prev) => prev.filter((t) => t.id !== Number.parseInt(id)));
      }
    } catch (err) {
      throw err;
    }
  };

  const getTasksByDate = (date) => {
    if (useApi && user) {
      return tasks.filter((task) => {
        const taskDate = new Date(task.date);
        return taskDate.toDateString() === date.toDateString();
      });
    }
    return storage.getTasksByDate(date);
  };

  const getTasksByProject = (projectId) => {
    if (useApi && user) {
      return tasks.filter(
        (task) => task.project_id === projectId || task.projectId === projectId
      );
    }
    return storage.getTasksByProject(projectId);
  };

  // User operations
  const updateUserProfile = async (userData) => {
    try {
      if (useApi && user) {
        const updated = await userApi.updateUser(userData);
        setUser(updated);
      } else {
        // For localStorage, merge with existing user data
        const updatedUser = { ...user, ...userData };
        storage.updateUser(updatedUser);
        setUser(updatedUser);
      }
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    try {
      if (useApi) {
        await authApi.logout();
      }
      // Clear state
      setProjects([]);
      setTasks([]);
      setUser(null);
      storage.clearAllData();
    } catch (err) {
      // Clear state anyway
      setProjects([]);
      setTasks([]);
      setUser(null);
      storage.clearAllData();
    }
  };

  const clearAllData = async () => {
    try {
      if (useApi && user) {
        await userApi.deleteUser();
      }
      // Clear state
      setProjects([]);
      setTasks([]);
      setUser(null);
      storage.clearAllData();
    } catch (err) {
      // Clear state anyway
      setProjects([]);
      setTasks([]);
      setUser(null);
      storage.clearAllData();
    }
  };

  const value = useMemo(
    () => ({
      projects,
      tasks,
      user,
      selectedDate,
      loading,
      error,
      setSelectedDate,
      setProjects,
      setTasks,
      createProject,
      editProject,
      removeProject,
      createTask,
      editTask,
      removeTask,
      getTasksByDate,
      getTasksByProject,
      updateUserProfile,
      logout,
      clearAllData,
      loadData,
    }),
    [projects, tasks, user, selectedDate, loading, error]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
