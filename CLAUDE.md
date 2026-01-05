# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Smart Task Manager is a full-stack React-based task management application with Neon Postgres database and Vercel serverless functions. Features secure JWT authentication, profile picture uploads, and responsive design optimized for both desktop (1024px+) and mobile devices. Includes localStorage fallback support for backward compatibility.

## Commands

### Development
```bash
npm run dev          # Start Vite dev server on http://localhost:5173
npm run dev:api      # Start Vercel dev server with API functions
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build
```

### Environment Variables
```bash
DATABASE_URL=postgresql://...       # Neon Postgres connection string
JWT_SECRET=your_secret_key          # Secret for JWT signing
VITE_USE_API=true                   # Enable API mode (vs localStorage)
VITE_API_BASE_URL=/api              # API base URL (optional)
```

## Architecture

### Data Flow & State Management

**AppContext Pattern**: The entire app uses a centralized Context API pattern (`src/context/AppContext.jsx`) that wraps all components. This context manages:
- Projects, tasks, and user state
- All CRUD operations for projects and tasks
- API communication or localStorage fallback
- Authentication state

**Critical Flow (API Mode)**: `AppContext` → `api.js` → Vercel Functions → Neon Database
- State is kept in React (useState) AND persisted to database
- Every mutation makes API calls to serverless functions
- On app load, state is hydrated from API via `loadData()`
- Authentication via JWT stored in HTTP-only cookies (1-hour expiration)

**Critical Flow (localStorage Mode)**: `AppContext` → `localStorage utils` → Browser localStorage
- Fallback mode for backward compatibility
- State is kept in React (useState) AND persisted to localStorage
- Every mutation updates both in-memory state and localStorage atomically

**Authentication Gate**: The app conditionally renders based on authentication state:
1. If `user === null` → Show `AuthScreen` (login/register)
2. If user exists → Show main app with router

This is handled in `App.jsx` via the `AppContent` component checking the user state.

### API Layer (`src/utils/api.js` and `api/*.js`)

**Frontend API Client** (`src/utils/api.js`):
- `authApi` - Register, login, logout, getCurrentUser
- `userApi` - Update user (name, profile_picture), delete user
- `projectsApi` - CRUD operations for projects
- `tasksApi` - CRUD operations for tasks
- All requests include `credentials: 'include'` for cookie authentication

**Backend API Endpoints** (`api/*.js`):
- `api/auth.js` - Authentication endpoints with JWT creation
- `api/users.js` - User profile management (requires auth)
- `api/projects.js` - Project CRUD (requires auth)
- `api/tasks.js` - Task CRUD (requires auth)
- `api/db.js` - Database connection and auth helper functions

**Authentication Flow**:
1. User registers/logs in via `AuthScreen`
2. Backend creates JWT (1-hour expiration) and sets HTTP-only cookie
3. All subsequent API requests include cookie automatically
4. Backend validates JWT from cookie on protected endpoints
5. Token expiration forces re-login for security

**Key Security Features**:
- JWT tokens expire after 1 hour
- HTTP-only cookies prevent XSS attacks
- Passwords hashed with bcrypt (10 salt rounds)
- CORS configured to allow credentials
- Cookie settings: `HttpOnly; Path=/; Max-Age=3600; SameSite=Lax`

### localStorage Layer (`src/utils/localStorage.js`)

**Storage Keys**:
- `taskManager_projects` - Project array
- `taskManager_tasks` - Task array
- `taskManager_user` - User object with name

**Key Behaviors**:
- `initializeStorage()` ensures empty arrays exist, but does NOT create a default user (WelcomeScreen handles that)
- All mutations return the updated entity for React state sync
- `deleteProject(id)` cascades: deletes project AND all associated tasks
- IDs are generated via `Date.now()` - simple but sufficient for single-user local storage

### Responsive Design Pattern

Components use a **dual-layout strategy**:
- Desktop (lg:block): Grid-based layouts, side-by-side content
- Mobile (lg:hidden): Stacked layouts, vertical scrolling

Example in `HomeScreen.jsx`:
```jsx
<div className="hidden lg:block">
  {/* Desktop: 3-column grid, all content visible */}
</div>
<div className="lg:hidden">
  {/* Mobile: Single column, cards */}
</div>
```

**Mobile Layout Specifics**:
- Task filter tabs ("My Tasks", "In progress", "Completed") are positioned in the tasks section, NOT in the header with the greeting
- Profile picture displays in navigation icon (circular, 24px)
- Stacked card layout for projects and tasks
- Full-width forms and inputs

### Component Hierarchy & Routes

```
App (AppProvider wrapper)
  └─ AppContent (checks authentication)
      ├─ AuthScreen (if no user - login/register)
      └─ Router (if authenticated)
          ├─ / → HomeScreen
          ├─ /calendar → CalendarScreen
          ├─ /task/new → TaskDetailScreen (create mode, supports ?projectId query param)
          ├─ /task/:id → TaskDetailScreen (edit mode)
          ├─ /project/new → CreateProject (create mode)
          ├─ /project/:id → CreateProject (edit mode)
          ├─ /project/:id/view → ProjectDetailScreen (view mode with task list)
          └─ /profile → ProfileSettings (with picture upload)
```

### Data Relationships

**Projects** have:
- `id`, `name`, `title`, `date`, `color` (gradient class string)

**Tasks** have:
- `id`, `title`, `description`, `date`, `startTime`, `endTime`, `tags[]`, `categories[]`, `status`, `projectId` (nullable)
- `projectId` links tasks to projects (can be null for unassigned tasks)
- When a project is deleted, all tasks with that `projectId` are also deleted

**User** has:
- `id`, `name`, `email`, `password` (hashed), `profile_picture` (base64 string, nullable)
- `profile_picture` stored as base64-encoded image (max 2MB)
- Profile picture displayed throughout the app in navigation icons

### Form Handling Pattern

Both `TaskDetailScreen` and `CreateProject` use the same pattern:
1. Detect create vs edit via URL param (`id === 'new'` or `useParams()`)
2. Initialize form state with empty values or fetch from localStorage
3. **IMPORTANT**: `projectId` from select dropdowns must be converted to number via `parseInt()` or set to `null`
4. On submit, call context method (createTask/editTask) then navigate away

**Breadcrumb Navigation**:
- TaskDetailScreen accepts `?projectId=X` query parameter for context
- When present, displays breadcrumb showing the project title
- Clicking breadcrumb navigates to `/project/:id/view`
- This provides better UX when creating tasks from project detail screens

### Calendar Implementation

`CalendarScreen.jsx` dynamically generates calendar dates:
- Calculates first day of month and offsets for proper grid alignment
- Filters tasks by selected date using date string comparison
- Displays task count badge for current month

### Profile Picture Implementation

**Upload Process** (`ProfileSettings.jsx`):
1. User clicks camera icon to trigger file input
2. File input validates image type and size (max 2MB)
3. FileReader converts image to base64 data URI
4. Base64 string stored in state and shown as preview
5. On form submit, base64 sent to API for database storage

**Storage**:
- Database column: `profile_picture TEXT` (nullable)
- Format: Full base64 data URI (e.g., `data:image/png;base64,iVBORw0K...`)
- API endpoint: `PUT /api/users` with `{ profile_picture: base64string }`

**Display**:
- HomeScreen navigation icons show profile picture (circular, 24px)
- ProfileSettings shows large preview (96px)
- Falls back to default user icon if no picture set

**Technical Notes**:
- Base64 increases size by ~33% (2MB image → ~2.7MB base64)
- Frontend validates file size BEFORE conversion
- Backend accepts null to remove profile picture
- SQL update query handles conditional updates (name only, picture only, or both)

### Styling Conventions

- Purple theme (`#8B5CF6` and gradients) used throughout
- Tailwind utility classes for all styling
- Custom animation in `index.css`: `animate-fadeIn` for welcome screen
- Project cards use dynamic gradient classes stored as strings (e.g., `'bg-gradient-to-br from-purple-600 to-purple-700'`)

### Accessibility Guidelines

**CRITICAL - Always follow these accessibility patterns:**

1. **Form Labels**: All form inputs MUST have associated labels
   - Use `htmlFor` attribute matching the input's `id`
   - Example: `<label htmlFor="task-title">Title</label>` with `<input id="task-title" />`

2. **Button Groups**: When labeling groups of buttons (not single inputs)
   - Use `<fieldset>` element instead of div with role="group"
   - Use `<legend>` instead of span for the group label
   - Example:
   ```jsx
   <fieldset className="mb-4">
     <legend className="text-sm opacity-75 mb-2 block">Tags</legend>
     <div className="flex gap-2">
       <button>Tag 1</button>
       <button>Tag 2</button>
     </div>
   </fieldset>
   ```

3. **Interactive Elements**: Always use semantic HTML
   - Use `<button type="button">` for clickable elements, NOT `<div role="button">`
   - Add `w-full text-left` classes to buttons that need div-like layout
   - Never use `tabIndex` and keyboard handlers on divs - use actual buttons

4. **React Keys**: Never use array index in keys
   - Use unique IDs from data (e.g., `task.id`, `project.id`)
   - For generated data without IDs, create unique identifiers
   - Example: Calendar dates use `id: ${year}-${month}-${day}` instead of index

5. **ARIA Labels**: Use for elements without visible text
   - `aria-label` on buttons with only icons
   - Example: `<button aria-label="Delete project">🗑️</button>`

## Common Pitfalls

1. **projectId Type Mismatch**: Select dropdowns return strings, but projectId must be stored as number or null. Always convert with `parseInt()` or check for empty string.

2. **State Sync**: When mutating data, BOTH localStorage and React state must be updated. Context methods handle this - always use context methods, never mutate localStorage directly from components.

3. **Cascading Deletes**: Deleting a project also deletes all tasks with that projectId. This is intentional and handled in `deleteProject()`.

4. **Date Handling**: Tasks store dates as ISO strings. Form inputs use `YYYY-MM-DD` format. Convert between these formats appropriately.

5. **User Null State**: A null user triggers the welcome screen. Don't default to an empty object - null is intentional to differentiate "no user" from "user with empty name".

6. **Responsive Breakpoints**: Desktop features kick in at `lg` (1024px). Don't use `md` for desktop layouts - components specifically use lg:block/lg:hidden pattern.

7. **"new" Route Parameter**: When checking if editing an existing entity, use `if (id && id !== 'new')`. The string "new" is used for create routes and is truthy, so checking just `if (id)` will incorrectly trigger edit mode.

8. **State Updates with Closures**: Always use functional updates for state that depends on previous state. Use `setState(prev => ...)` instead of `setState(state)` to avoid stale closure issues.
   - Bad: `setProjects([...projects, newProject])`
   - Good: `setProjects(prev => [...prev, newProject])`

9. **Accessibility Violations**: Never skip accessibility requirements
   - All labels must be associated with inputs using htmlFor
   - Use `<fieldset>` and `<legend>` for button groups, not `<div role="group">`
   - Use semantic HTML (`<button>` not `<div role="button">`)
   - Never use array indices as React keys

10. **Authentication Token Expiration**: JWT tokens expire after 1 hour
   - Backend rejects expired tokens with 401 status
   - Frontend should handle 401 by redirecting to login
   - User must log in again after session expires

11. **API vs localStorage Mode**: Check `VITE_USE_API` environment variable
   - API mode: Makes HTTP requests to serverless functions
   - localStorage mode: Legacy fallback for backward compatibility
   - AppContext handles both modes transparently
   - Never mix API calls with localStorage mutations

12. **SQL Query Construction**: Neon serverless driver uses tagged template literals
   - Use `sql\`UPDATE users SET name = ${name}\`` (correct)
   - Don't use `sql\`UPDATE users SET ${sql(values)}\`` (incorrect - causes "$1" syntax error)
   - For conditional updates, use explicit if/else branches with complete queries

13. **Profile Picture Size**: Images must be under 2MB before upload
   - Validate file size BEFORE converting to base64
   - Base64 encoding increases size by ~33%
   - Large images can cause database performance issues

## Data Persistence Notes

**API Mode (Primary)**:
- Data stored in Neon Postgres database
- Serverless functions on Vercel handle API requests
- Authentication required for all operations
- Data persists across devices and browsers
- "Delete Profile" feature deletes user and all associated data from database

**localStorage Mode (Legacy)**:
- Data stored client-side only in browser localStorage
- localStorage has ~5-10MB limit (plenty for this use case)
- Clearing browser data or using incognito will lose all data
- No authentication required
- "Delete Profile" feature clears ALL localStorage data and returns to welcome screen

**Migration Path**:
- App supports both modes via `VITE_USE_API` environment variable
- `migrateLocalStorageToDb()` function available in `api.js` for data migration
- localStorage mode maintained for backward compatibility

## PWA & SEO

The app is configured as a Progressive Web App:
- `public/manifest.json` defines app metadata, icons, and shortcuts
- `public/favicon.svg` provides a custom purple gradient checklist icon
- `index.html` includes comprehensive meta tags:
  - SEO optimization (description, keywords, author)
  - Open Graph tags for Facebook sharing
  - Twitter Card tags for Twitter sharing
  - Theme color and viewport settings
  - PWA manifest link

App shortcuts in manifest:
- "New Task" → `/task/new`
- "Calendar" → `/calendar`
