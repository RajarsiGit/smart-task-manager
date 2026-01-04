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
  - Detailed project view with associated tasks
  - Breadcrumb navigation for better context

- **Task Management**
  - Create, edit, and delete tasks
  - Set task dates, start/end times
  - Add custom tags and categories
  - Assign tasks to projects
  - Mark tasks as completed
  - Filter tasks by status (All, In Progress, Completed)
  - View project context on task tiles
  - Breadcrumb navigation when creating tasks from projects

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

- **Profile Management**
  - Update your display name anytime
  - Delete profile option to clear all data
  - Two-step confirmation to prevent accidental deletion
  - Complete data reset returns to welcome screen

- **Accessibility & SEO**
  - Full WCAG compliance with proper ARIA labels
  - Semantic HTML throughout the application
  - All form labels properly associated with controls
  - Keyboard navigation support
  - Progressive Web App (PWA) ready with manifest
  - Comprehensive meta tags for SEO
  - Open Graph and Twitter Card support for social sharing
  - Custom favicon representing task management

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- [Neon Account](https://console.neon.tech/signup) (for database)
- [Vercel Account](https://vercel.com/signup) (for deployment)

### Local Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Add your Neon database URL to `.env`:
   ```
   DATABASE_URL=your_neon_connection_string
   ```

3. **Initialize database:**
   - Login to [Neon Console](https://console.neon.tech)
   - Create a new project
   - Run the SQL from `schema.sql` in the SQL Editor

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Deploy to Vercel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions with Neon Postgres.

## Usage

### First Time Setup

When you first launch the app, you'll be greeted with a welcome screen asking for your name. This personalization makes the app feel more welcoming and your name will be displayed on the home screen.

The app starts completely empty - no default projects or tasks. You have a clean slate to organize your work the way you want!

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

### Profile Settings

Access your profile settings by clicking the profile icon in the home screen header:
- **Update Name**: Change your display name
- **Delete Profile**: Permanently delete your profile and all data
  - This removes all projects, tasks, and user information
  - Returns you to the welcome screen
  - Cannot be undone - use with caution!

## Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation

### Backend
- **Vercel Serverless Functions** - API endpoints
- **Neon Postgres** - Cloud database
- **@neondatabase/serverless** - Database driver

### Data Persistence
- **Cloud Database** - PostgreSQL on Neon (primary)
- **localStorage** - Local fallback/migration support

## Project Structure

```
src/
├── components/
│   ├── HomeScreen.jsx           # Main dashboard
│   ├── CalendarScreen.jsx       # Calendar view
│   ├── TaskDetailScreen.jsx     # Task create/edit form
│   ├── CreateProject.jsx        # Project create/edit form
│   ├── ProjectDetailScreen.jsx  # Project detail view
│   ├── ProfileSettings.jsx      # User profile settings
│   └── WelcomeScreen.jsx        # First-time setup screen
├── context/
│   └── AppContext.jsx           # Global state management
├── utils/
│   ├── api.js                   # API client for serverless functions
│   └── localStorage.js          # localStorage utilities (legacy)
├── App.jsx                      # Main app component
├── main.jsx                     # App entry point
└── index.css                    # Global styles
api/
├── db.js                        # Neon database connection
├── users.js                     # User management endpoint
├── projects.js                  # Projects CRUD endpoint
└── tasks.js                     # Tasks CRUD endpoint
public/
├── favicon.svg                  # Custom app icon
└── manifest.json                # PWA manifest
```

## License

MIT
