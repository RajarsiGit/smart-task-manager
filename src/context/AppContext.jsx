import { createContext, useContext, useState, useEffect } from 'react'
import * as storage from '../utils/localStorage'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [user, setUser] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setProjects(storage.getProjects())
    setTasks(storage.getTasks())
    setUser(storage.getUser())
  }

  // Project operations
  const createProject = (projectData) => {
    const newProject = storage.addProject(projectData)
    setProjects(prev => [...prev, newProject])
    return newProject
  }

  const editProject = (id, updates) => {
    const updated = storage.updateProject(id, updates)
    if (updated) {
      setProjects(prev => prev.map(p => p.id === id ? updated : p))
    }
    return updated
  }

  const removeProject = (id) => {
    storage.deleteProject(id)
    setProjects(prev => prev.filter(p => p.id !== id))
    setTasks(prev => prev.filter(t => t.projectId !== id))
  }

  // Task operations
  const createTask = (taskData) => {
    const newTask = storage.addTask(taskData)
    setTasks(prev => [...prev, newTask])
    return newTask
  }

  const editTask = (id, updates) => {
    const updated = storage.updateTask(id, updates)
    if (updated) {
      setTasks(prev => prev.map(t => t.id === parseInt(id) ? updated : t))
    }
    return updated
  }

  const removeTask = (id) => {
    storage.deleteTask(id)
    setTasks(prev => prev.filter(t => t.id !== parseInt(id)))
  }

  const getTasksByDate = (date) => {
    return storage.getTasksByDate(date)
  }

  const getTasksByProject = (projectId) => {
    return storage.getTasksByProject(projectId)
  }

  // User operations
  const updateUserProfile = (userData) => {
    storage.updateUser(userData)
    setUser(userData)
  }

  const clearAllData = () => {
    storage.clearAllData()
    setProjects([])
    setTasks([])
    setUser(null)
  }

  const value = {
    projects,
    tasks,
    user,
    selectedDate,
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
    loadData
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
