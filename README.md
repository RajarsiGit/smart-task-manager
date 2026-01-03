# Smart Task Manager

A beautiful and functional task management application built with React, Vite, and Tailwind CSS. Fully responsive design optimized for both desktop and mobile devices. All data is stored locally in your browser's localStorage.

## Features

- **Responsive Design**
  - Optimized layouts for desktop (1024px+), tablet (768px+), and mobile devices
  - Grid-based layouts on desktop for better space utilization
  - Mobile-first design with enhanced desktop experience
  - Smooth transitions between breakpoints

- **Project Management**
  - Create, edit, and delete projects
  - Customize project colors with 6 gradient themes
  - View all projects on the home screen

- **Task Management**
  - Create, edit, and delete tasks
  - Set task dates, start/end times
  - Add custom tags and categories
  - Assign tasks to projects
  - Mark tasks as completed
  - Filter tasks by status (All, In Progress, Completed)

- **Calendar View**
  - Interactive calendar with month navigation
  - View tasks for specific dates
  - See total events per month
  - Quick task creation from calendar

- **Data Persistence**
  - All data stored in browser localStorage
  - Data persists across sessions
  - No backend required
  - First-time setup screen to capture user name

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### First Time Setup

When you first launch the app, you'll be greeted with a welcome screen asking for your name. This personalization makes the app feel more welcoming and your name will be displayed on the home screen.

### Creating a Project

1. Click the "+" button on the home screen
2. Enter project name and title
3. Choose a color theme
4. Click "Create Project"

### Creating a Task

1. Click the "+ New Task" button on the home screen or calendar
2. Fill in task details:
   - Task name (required)
   - Date (required)
   - Start and end times (optional)
   - Project assignment (optional)
   - Description (optional)
   - Tags and categories
3. Click "Create Task"

### Editing

- **Projects**: Hover over a project card and click the edit icon
- **Tasks**: Click on a task to open the edit form

### Deleting

- **Projects**: Hover over a project card and click the delete icon (also deletes all associated tasks)
- **Tasks**: Open the task and click the delete icon in the header

### Filtering Tasks

Use the tabs on the home screen to filter tasks:
- **My Tasks**: Show all tasks
- **In Progress**: Show only in-progress tasks
- **Completed**: Show only completed tasks

## Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **localStorage** - Data persistence

## Project Structure

```
src/
├── components/
│   ├── HomeScreen.jsx          # Main dashboard
│   ├── CalendarScreen.jsx      # Calendar view
│   ├── TaskDetailScreen.jsx    # Task create/edit form
│   └── CreateProject.jsx       # Project create/edit form
├── context/
│   └── AppContext.jsx          # Global state management
├── utils/
│   └── localStorage.js         # localStorage utilities
├── App.jsx                     # Main app component
├── main.jsx                    # App entry point
└── index.css                   # Global styles
```

## License

MIT
