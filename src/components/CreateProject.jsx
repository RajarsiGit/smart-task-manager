import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const CreateProject = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { projects, createProject, editProject } = useApp()

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    color: 'bg-gradient-to-br from-purple-600 to-purple-700'
  })

  const colorOptions = [
    { label: 'Purple', value: 'bg-gradient-to-br from-purple-600 to-purple-700' },
    { label: 'Blue', value: 'bg-gradient-to-br from-blue-600 to-blue-700' },
    { label: 'Green', value: 'bg-gradient-to-br from-green-600 to-green-700' },
    { label: 'Pink', value: 'bg-gradient-to-br from-pink-600 to-pink-700' },
    { label: 'Orange', value: 'bg-gradient-to-br from-orange-600 to-orange-700' },
    { label: 'Dark Purple', value: 'bg-gradient-to-br from-purple-700 to-purple-800' },
  ]

  useEffect(() => {
    if (id) {
      const project = projects.find(p => p.id === parseInt(id))
      if (project) {
        setFormData({
          name: project.name,
          title: project.title,
          color: project.color
        })
      }
    }
  }, [id, projects])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (id) {
      editProject(parseInt(id), formData)
    } else {
      createProject(formData)
    }
    navigate('/')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate('/')} className="p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold">{id ? 'Edit Project' : 'Create Project'}</h2>
          <div className="w-10"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Project 0.1"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-base lg:text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., UI/UX Designing"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-base lg:text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Color Theme
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color: option.value }))}
                  className={`${option.value} h-16 rounded-xl transition transform hover:scale-105 ${
                    formData.color === option.value ? 'ring-4 ring-purple-400' : ''
                  }`}
                >
                  <span className="sr-only">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition"
            >
              {id ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProject
