import { createContext, useContext, useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { userApi, projectsApi, tasksApi } from "../utils/api";
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
  const useApi = Boolean(import.meta.env.VITE_USE_API !== 'false');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (useApi) {
        // Load user from localStorage first
        const storedUser = storage.getUser();

        if (storedUser && storedUser.email) {
          console.log('Verifying user with API:', storedUser.email);

          try {
            // Verify/sync user with API database
            const apiUser = await userApi.getUser(storedUser.email, storedUser.name);

            console.log('API user:', apiUser);

            // Update localStorage if API returned different data
            if (apiUser.name !== storedUser.name || apiUser.id !== storedUser.id) {
              console.log('Syncing user data from API to localStorage');
              storage.updateUser(apiUser);
              setUser(apiUser);
            } else {
              setUser(storedUser);
            }

            // Fetch projects and tasks from API
            const [projectsData, tasksData] = await Promise.all([
              projectsApi.getAll(),
              tasksApi.getAll()
            ]);

            console.log('Loaded from API:', { projects: projectsData.length, tasks: tasksData.length });
            setProjects(projectsData);
            setTasks(tasksData);
          } catch (apiError) {
            console.error('API error, falling back to localStorage:', apiError);
            // API failed, use localStorage
            setUser(storedUser);
            setProjects(storage.getProjects());
            setTasks(storage.getTasks());
            setError('Using offline mode - API unavailable');
          }
        } else {
          // No user in localStorage, load from localStorage as fallback
          console.log('No user found, using localStorage');
          setProjects(storage.getProjects());
          setTasks(storage.getTasks());
          setUser(null);
        }
      } else {
        // Load from localStorage only
        console.log('API disabled, using localStorage only');
        setProjects(storage.getProjects());
        setTasks(storage.getTasks());
        setUser(storage.getUser());
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
      // Fallback to localStorage on error
      setProjects(storage.getProjects());
      setTasks(storage.getTasks());
      setUser(storage.getUser());
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
      console.error('Error creating project:', err);
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
      console.error('Error updating project:', err);
      throw err;
    }
  };

  const removeProject = async (id) => {
    try {
      if (useApi && user) {
        await projectsApi.delete(id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
        setTasks((prev) => prev.filter((t) => t.project_id !== id && t.projectId !== id));
      } else {
        storage.deleteProject(id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
        setTasks((prev) => prev.filter((t) => t.projectId !== id));
      }
    } catch (err) {
      console.error('Error deleting project:', err);
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
      console.error('Error creating task:', err);
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
      console.error('Error updating task:', err);
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
      console.error('Error deleting task:', err);
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
      return tasks.filter((task) => task.project_id === projectId || task.projectId === projectId);
    }
    return storage.getTasksByProject(projectId);
  };

  // User operations
  const updateUserProfile = async (userData) => {
    try {
      if (useApi) {
        // If user exists, update them
        if (user && user.email) {
          const updated = await userApi.updateUser(user.email, userData.name);
          setUser(updated);
          storage.updateUser(updated); // Keep localStorage in sync
        } else {
          // New user - create in API
          const newUser = await userApi.getUser(userData.email, userData.name);
          console.log('Created new user in API:', newUser);
          setUser(newUser);
          storage.updateUser(newUser); // Save to localStorage

          // Reload data after user creation
          await loadData();
        }
      } else {
        storage.updateUser(userData);
        setUser(userData);
      }
    } catch (err) {
      console.error('Error updating user:', err);
      // On error, still save to localStorage
      storage.updateUser(userData);
      setUser(userData);
    }
  };

  const clearAllData = async () => {
    try {
      if (useApi && user) {
        await userApi.deleteUser(user.email);
      }
      storage.clearAllData();
      setProjects([]);
      setTasks([]);
      setUser(null);
    } catch (err) {
      console.error('Error clearing data:', err);
      // Clear localStorage anyway
      storage.clearAllData();
      setProjects([]);
      setTasks([]);
      setUser(null);
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
      createProject,
      editProject,
      removeProject,
      createTask,
      editTask,
      removeTask,
      getTasksByDate,
      getTasksByProject,
      updateUserProfile,
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
