# Local Development Guide

Complete guide for running Smart Task Manager locally with Neon Postgres API.

## Prerequisites

1. **Node.js** v18 or higher
2. **npm** or **yarn**
3. **Neon Database** account and project
4. **Vercel CLI** (optional, for running API locally)

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Neon Database

1. Create account at https://console.neon.tech
2. Create a new project
3. Copy your connection string
4. In Neon SQL Editor, run the SQL from `schema.sql`

### 3. Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
# Your Neon Postgres connection string
DATABASE_URL=postgres://user:password@host/database?sslmode=require

# API base URL (defaults to /api)
VITE_API_BASE_URL=/api

# Enable API mode (set to 'false' to use localStorage only)
VITE_USE_API=true
```

## Running Locally

You have two options for local development:

### Option 1: Using Vercel CLI (Recommended)

This runs both the frontend and API routes locally:

```bash
# Install Vercel CLI globally
npm install -g vercel

# Run in development mode
npm run dev:api
```

This starts:
- Frontend on http://localhost:3000
- API routes at http://localhost:3000/api

### Option 2: Vite Only (Frontend + Proxy)

This runs Vite with a proxy to forward API requests:

**Terminal 1 - Start Vercel Dev Server:**
```bash
vercel dev --listen 3000
```

**Terminal 2 - Start Vite:**
```bash
npm run dev
```

This starts:
- Vercel API server on http://localhost:3000
- Vite frontend on http://localhost:5173
- Vite proxies `/api` requests to `localhost:3000`

### Option 3: localStorage Only (No API)

To run without the database (localStorage only):

```bash
# Set VITE_USE_API to false in .env
VITE_USE_API=false

# Run Vite
npm run dev
```

## Testing the Setup

### 1. Check Frontend

Open http://localhost:5173 (or 3000 if using vercel dev)

You should see the welcome screen asking for name and email.

### 2. Test API Endpoints

```bash
# Test users endpoint
curl http://localhost:3000/api/users?email=test@example.com

# Test projects endpoint
curl -H "x-user-email: test@example.com" http://localhost:3000/api/projects
```

### 3. Check Database Connection

1. Create a user through the welcome screen
2. Open browser console (F12)
3. Run:
```javascript
fetch('/api/projects', {
  headers: { 'x-user-email': 'your@email.com' }
})
  .then(r => r.json())
  .then(console.log);
```

You should see an array of projects (empty if none created).

## How It Works

### Data Flow

```
User Action
    ↓
React Component
    ↓
AppContext (API or localStorage)
    ↓
API Client (/src/utils/api.js)
    ↓
Serverless Function (/api/*.js)
    ↓
Neon Postgres Database
```

### API Mode Detection

The app checks `VITE_USE_API` environment variable:

- `true` or undefined → Use API (requires database)
- `false` → Use localStorage only

### User Authentication

Currently using simple email-based auth:
- User email stored in localStorage
- Sent via `x-user-email` header with each API request
- **This is temporary** - implement proper auth for production

### Proxy Configuration

Vite is configured to proxy `/api` requests:

**vite.config.js:**
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    }
  }
}
```

## Troubleshooting

### "DATABASE_URL is not set"

**Problem:** API can't connect to database

**Solutions:**
1. Check `.env` file exists
2. Verify `DATABASE_URL` is set correctly
3. Ensure Vercel CLI has access to `.env`
4. Run `vercel env pull` to sync environment variables

### "User email required in x-user-email header"

**Problem:** API request missing user email

**Solutions:**
1. Complete welcome screen to set user email
2. Check localStorage has user data:
   ```javascript
   localStorage.getItem('taskManager_user')
   ```
3. If empty, clear data and restart

### API returns 404

**Problem:** API routes not found

**Solutions:**
1. Ensure running `vercel dev` or `npm run dev:api`
2. Check `/api` folder exists in project root
3. Verify `vercel.json` configuration
4. Restart dev server

### CORS errors

**Problem:** Browser blocks API requests

**Solutions:**
1. Check `vercel.json` has CORS headers
2. Verify API and frontend on same origin when using Vercel dev
3. Check browser console for specific CORS error

### Changes not reflected

**Problem:** Code changes not showing

**Solutions:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Restart dev server
4. Check for build errors in terminal

### "Failed to fetch"

**Problem:** Can't reach API

**Solutions:**
1. Verify Vercel dev server is running on port 3000
2. Check Vite proxy configuration
3. Ensure DATABASE_URL is correct
4. Check Neon project is active

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | Neon Postgres connection string | Yes | - |
| `VITE_API_BASE_URL` | API base URL | No | `/api` |
| `VITE_USE_API` | Enable API mode | No | `true` |

## Development Commands

```bash
# Start Vite dev server only
npm run dev

# Start Vercel dev server (frontend + API)
npm run dev:api

# Build for production
npm run build

# Preview production build
npm run preview
```

## File Structure for Development

```
src/
├── context/
│   └── AppContext.jsx    # API/localStorage switch logic
├── utils/
│   ├── api.js            # API client functions
│   └── localStorage.js   # LocalStorage fallback
└── components/           # React components

api/
├── db.js                 # Database connection
├── users.js              # User endpoints
├── projects.js           # Project endpoints
└── tasks.js              # Task endpoints

vite.config.js            # Vite config with proxy
vercel.json               # Vercel deployment config
.env                      # Local environment variables
```

## Best Practices

1. **Always run Vercel dev** when testing API features
2. **Clear localStorage** when switching between API/localStorage modes
3. **Check console** for API errors and network requests
4. **Use browser DevTools** Network tab to debug API calls
5. **Keep .env secure** - never commit to git

## Next Steps

After getting local development working:

1. ✅ Verify API calls are working
2. ⬜ Test all CRUD operations
3. ⬜ Add proper authentication
4. ⬜ Deploy to Vercel
5. ⬜ Test production deployment
6. ⬜ Add error handling and loading states
7. ⬜ Implement data migration from localStorage

## Resources

- **Vercel CLI Docs**: https://vercel.com/docs/cli
- **Vite Proxy Docs**: https://vitejs.dev/config/server-options.html#server-proxy
- **Neon Docs**: https://neon.tech/docs
- **Project Setup**: [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)
- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
