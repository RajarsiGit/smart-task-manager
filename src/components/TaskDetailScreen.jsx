import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import * as storage from '../utils/localStorage'

const TaskDetailScreen = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { createTask, editTask, removeTask, projects } = useApp()

  const isNewTask = id === 'new'

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    tags: [],
    categories: [],
    status: 'pending',
    projectId: null
  })

  const [newTag, setNewTag] = useState('')
  const [newCategory, setNewCategory] = useState('')

  const availableTags = ['Design', 'Meeting', 'Coding', 'Testing', 'Planning', 'Review']
  const availableCategories = ['UI', 'Testing', 'Quick call', 'Backend', 'Frontend', 'DevOps']

  useEffect(() => {
    if (!isNewTask && id) {
      const task = storage.getTaskById(id)
      if (task) {
        setFormData({
          title: task.title,
          description: task.description || '',
          date: new Date(task.date).toISOString().split('T')[0],
          startTime: task.startTime || '',
          endTime: task.endTime || '',
          tags: task.tags || [],
          categories: task.categories || [],
          status: task.status || 'pending',
          projectId: task.projectId || null
        })
      }
    }
  }, [id, isNewTask])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const toggleTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const addCustomTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }))
      setNewTag('')
    }
  }

  const toggleCategory = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }))
  }

  const addCustomCategory = () => {
    if (newCategory.trim() && !formData.categories.includes(newCategory.trim())) {
      setFormData(prev => ({ ...prev, categories: [...prev.categories, newCategory.trim()] }))
      setNewCategory('')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const taskData = {
      ...formData,
      date: new Date(formData.date).toISOString()
    }

    if (isNewTask) {
      createTask(taskData)
    } else {
      editTask(id, taskData)
    }
    navigate('/')
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      removeTask(id)
      navigate('/')
    }
  }

  const toggleStatus = () => {
    const newStatus = formData.status === 'completed' ? 'pending' : 'completed'
    setFormData(prev => ({ ...prev, status: newStatus }))
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-3xl shadow-xl p-6 lg:p-8 text-white">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button type="button" onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm opacity-90">{isNewTask ? 'Create Task' : 'Edit Task'}</span>
          {!isNewTask && (
            <button type="button" onClick={handleDelete} className="p-2 hover:bg-red-500 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          {isNewTask && <div className="w-10"></div>}
        </div>

        {/* Task Info */}
        <div className="mb-6 space-y-4">
          <div>
            <label className="text-sm opacity-75 mb-2 block">Task Name</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task name"
              required
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 text-base lg:text-lg"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm opacity-75 mb-2 block">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>

            <div>
              <label className="text-sm opacity-75 mb-2 block">Project (Optional)</label>
              <select
                name="projectId"
                value={formData.projectId || ''}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="" className="text-gray-900">No Project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id} className="text-gray-900">
                    {project.name} - {project.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time Slots */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm opacity-75 mb-2 block">Start Time</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <div>
              <label className="text-sm opacity-75 mb-2 block">End Time</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="text-sm opacity-75 mb-2 block">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter task description"
            rows={3}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>

        {/* Tags */}
        <div className="mb-4">
          <label className="text-sm opacity-75 mb-2 block">Tags</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  formData.tags.includes(tag)
                    ? 'bg-purple-800 text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          {formData.tags.filter(t => !availableTags.includes(t)).map((tag) => (
            <span key={tag} className="inline-block px-4 py-2 bg-purple-800 rounded-full text-sm font-medium text-white mr-2 mb-2">
              {tag}
            </span>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add custom tag"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <button
              type="button"
              onClick={addCustomTag}
              className="px-4 py-2 bg-white/20 rounded-xl text-sm hover:bg-white/30"
            >
              Add
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <label className="text-sm opacity-75 mb-2 block">Categories</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {availableCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  formData.categories.includes(category)
                    ? 'bg-purple-800 text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          {formData.categories.filter(c => !availableCategories.includes(c)).map((category) => (
            <span key={category} className="inline-block px-4 py-2 bg-purple-800 rounded-full text-sm font-medium text-white mr-2 mb-2">
              {category}
            </span>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Add custom category"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomCategory())}
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <button
              type="button"
              onClick={addCustomCategory}
              className="px-4 py-2 bg-white/20 rounded-xl text-sm hover:bg-white/30"
            >
              Add
            </button>
          </div>
        </div>

        {/* Status Toggle */}
        {!isNewTask && (
          <div className="mb-6">
            <button
              type="button"
              onClick={toggleStatus}
              className={`w-full py-3 rounded-xl font-semibold transition ${
                formData.status === 'completed'
                  ? 'bg-green-500 text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {formData.status === 'completed' ? '✓ Completed' : 'Mark as Complete'}
            </button>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-white text-purple-600 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
        >
          {isNewTask ? 'Create Task' : 'Update Task'}
        </button>
      </form>
    </div>
  )
}

export default TaskDetailScreen
