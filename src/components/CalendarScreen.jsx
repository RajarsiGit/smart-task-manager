import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const CalendarScreen = () => {
  const navigate = useNavigate()
  const { tasks, selectedDate, setSelectedDate } = useApp()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarDates, setCalendarDates] = useState([])

  const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

  useEffect(() => {
    generateCalendar()
  }, [currentDate])

  const generateCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // Get first day of week (0 = Sunday, 1 = Monday, etc.)
    let firstDayOfWeek = firstDay.getDay()
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1 // Convert to Monday = 0

    const daysInMonth = lastDay.getDate()

    const dates = []

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
      dates.push({ date: null, day: '' })
    }

    // Add actual dates
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' })
      dates.push({
        date: day,
        day: dayOfWeek.substring(0, 2),
        fullDate: date
      })
    }

    setCalendarDates(dates)
  }

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const getTasksForSelectedDate = () => {
    return tasks.filter(task => {
      const taskDate = new Date(task.date)
      return taskDate.toDateString() === selectedDate.toDateString()
    })
  }

  const tasksForDate = getTasksForSelectedDate()
  const totalEventsInMonth = tasks.filter(task => {
    const taskDate = new Date(task.date)
    return taskDate.getMonth() === currentDate.getMonth() &&
           taskDate.getFullYear() === currentDate.getFullYear()
  }).length

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={() => navigate('/task/new')} className="p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Month Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-2xl lg:text-3xl font-bold">
              {currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </h2>
            <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium self-start sm:self-auto">
            {totalEventsInMonth} {totalEventsInMonth === 1 ? 'Event' : 'Events'}
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Calendar Grid */}
          <div>
            {/* Days of week */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center text-sm text-gray-500 font-medium">
                  {day}
                </div>
              ))}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDates.map((item, index) => (
                <div key={index} className="aspect-square">
                  {item.date && (
                    <button
                      onClick={() => setSelectedDate(item.fullDate)}
                      className={`w-full h-full rounded-xl flex flex-col items-center justify-center transition ${
                        selectedDate.toDateString() === item.fullDate.toDateString()
                          ? 'bg-purple-600 text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className={`text-xs ${selectedDate.toDateString() === item.fullDate.toDateString() ? 'text-purple-200' : 'text-gray-400'}`}>
                        {item.day}
                      </span>
                      <span className="text-lg font-semibold">{item.date}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tasks List */}
          <div className="mt-6 lg:mt-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg lg:text-xl font-bold">
                Tasks for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </h3>
            </div>
            <div className="space-y-3">
            {tasksForDate.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-3">No tasks for this date</p>
                <button
                  onClick={() => navigate('/task/new')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition text-sm"
                >
                  Create Task
                </button>
              </div>
            ) : (
              tasksForDate.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition"
                  onClick={() => navigate(`/task/${task.id}`)}
                >
                  <div className="bg-purple-600 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-gray-700 font-medium block">{task.title}</span>
                    {task.startTime && task.endTime && (
                      <span className="text-xs text-gray-400">{task.startTime} - {task.endTime}</span>
                    )}
                  </div>
                  {task.status === 'completed' && (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              ))
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarScreen
