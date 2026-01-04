# Setup Instructions - Neon Postgres + Vercel Integration

Complete guide for setting up Smart Task Manager with cloud database and serverless API.

## Architecture Overview

```
Frontend (React + Vite)
    ↓
Vercel Serverless Functions (/api)
    ↓
Neon Postgres Database
```

## What Changed?

### Before (localStorage only)
- All data stored in browser
- No backend or database
- Data lost if browser cache cleared
- No cross-device sync

### After (Cloud Database)
- Data stored in Neon Postgres
- Vercel serverless API endpoints
- Data persists across devices
- Multi-user support ready
- Professional cloud infrastructure

## Files Created

### Database & API
- `schema.sql` - PostgreSQL database schema
- `api/db.js` - Database connection utility
- `api/users.js` - User management endpoint
- `api/projects.js` - Projects CRUD endpoint
- `api/tasks.js` - Tasks CRUD endpoint

### Frontend
- `src/utils/api.js` - API client for frontend

### Configuration
- `vercel.json` - Vercel deployment config
- `.env.example` - Environment variables template
- `DEPLOYMENT.md` - Full deployment guide
- `QUICKSTART.md` - 5-minute setup guide

### Updated
- `package.json` - Added @neondatabase/serverless
- `README.md` - Updated with new architecture
- `.gitignore` - Added .env to ignored files

## Environment Variables

### Required
- `DATABASE_URL` - Your Neon Postgres connection string

### Optional
- `VITE_API_BASE_URL` - API base URL (defaults to `/api`)

## Database Schema

The database has 3 main tables:

### Users
- `id` (auto-increment)
- `name` - User display name
- `email` - User email (unique)
- `created_at`, `updated_at`

### Projects
- `id` (auto-increment)
- `user_id` - References users(id)
- `name` - Project name
- `title` - Project title
- `color` - Gradient class string
- `created_at`, `updated_at`

### Tasks
- `id` (auto-increment)
- `user_id` - References users(id)
- `project_id` - References projects(id), nullable
- `title` - Task title
- `description` - Task description
- `date` - Task date
- `start_time`, `end_time` - Time strings
- `status` - 'pending', 'in_progress', 'completed'
- `tags` - Array of tag strings
- `categories` - Array of category strings
- `created_at`, `updated_at`

## API Authentication (Current)

Currently uses simple email-based auth via `x-user-email` header.

**This is temporary for development!**

For production, implement one of:
1. NextAuth.js (OAuth providers)
2. Clerk (full auth solution)
3. Auth0 (enterprise)
4. Custom JWT implementation

## Migration from localStorage

To migrate existing localStorage data to database:

1. Ensure you're logged in with user email set
2. Open browser console
3. Run migration function:

```javascript
import { migrateLocalStorageToDb } from '/src/utils/api.js';

migrateLocalStorageToDb()
  .then(result => {
    console.log('✅ Migration successful!');
    console.log(`Projects migrated: ${result.migratedProjects}`);
    console.log(`Tasks migrated: ${result.migratedTasks}`);
  })
  .catch(error => {
    console.error('❌ Migration failed:', error);
  });
```

## Local Development

### First Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env

# 3. Add your Neon connection string to .env
# DATABASE_URL=postgres://...

# 4. Start dev server
npm run dev
```

### Running Locally

```bash
npm run dev
```

Vite will serve the frontend at http://localhost:5173 and proxy API requests to `/api`.

## Production Deployment

### Method 1: Vercel Dashboard (Recommended)

1. Push code to GitHub
2. Go to vercel.com/new
3. Import your repository
4. Add environment variable: `DATABASE_URL`
5. Click Deploy

### Method 2: Vercel CLI

```bash
# Install CLI
npm install -g vercel

# Login
vercel login

# Add environment variable
vercel env add DATABASE_URL

# Deploy
vercel --prod
```

## Testing API Endpoints

### Using curl

```bash
# Get user
curl -X GET "http://localhost:3000/api/users?email=test@example.com"

# Create project
curl -X POST "http://localhost:3000/api/projects" \
  -H "Content-Type: application/json" \
  -H "x-user-email: test@example.com" \
  -d '{
    "name": "Work",
    "title": "Work Projects",
    "color": "bg-gradient-to-br from-purple-600 to-purple-700"
  }'

# Create task
curl -X POST "http://localhost:3000/api/tasks" \
  -H "Content-Type: application/json" \
  -H "x-user-email: test@example.com" \
  -d '{
    "title": "Complete API integration",
    "description": "Finish Neon Postgres setup",
    "date": "2024-01-15T00:00:00Z",
    "status": "in_progress",
    "tags": ["development", "backend"],
    "categories": ["Work"]
  }'
```

### Using JavaScript (Browser Console)

```javascript
// Fetch all projects
fetch('/api/projects', {
  headers: { 'x-user-email': 'test@example.com' }
})
  .then(r => r.json())
  .then(console.log);

// Create task
fetch('/api/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-email': 'test@example.com'
  },
  body: JSON.stringify({
    title: 'Test Task',
    date: new Date().toISOString(),
    status: 'pending'
  })
})
  .then(r => r.json())
  .then(console.log);
```

## Common Issues

### "DATABASE_URL environment variable is not set"
- Create `.env` file with `DATABASE_URL=...`
- For Vercel, add it in project settings

### "User email required in x-user-email header"
- API requires user email for authentication
- Pass via header or implement proper auth

### CORS errors in browser
- Check `vercel.json` exists with CORS headers
- Verify API routes are in `/api` directory

### API routes return 404
- Ensure `/api` folder exists (not `/src/api`)
- Check `vercel.json` configuration
- Redeploy after adding API routes

### Database connection timeout
- Verify Neon project is active
- Check connection string is correct
- Ensure SSL mode is enabled in URL

## Performance Optimization

### Database
- Indexes already created on frequently queried columns
- Use query filters to limit results
- Consider pagination for large datasets

### API
- Serverless functions have 10s timeout (Hobby plan)
- Optimize queries to return only needed fields
- Cache responses where appropriate

### Frontend
- API responses cached in React context
- localStorage as offline fallback
- Consider React Query for advanced caching

## Security Checklist

- [ ] DATABASE_URL stored securely in Vercel env vars
- [ ] `.env` added to `.gitignore`
- [ ] Implement proper authentication
- [ ] Add rate limiting to API endpoints
- [ ] Sanitize user inputs
- [ ] Enable HTTPS only (Vercel does this automatically)
- [ ] Set up Neon IP allowlist (optional)
- [ ] Add API request logging

## Monitoring & Maintenance

### Neon Dashboard
- View active connections
- Monitor query performance
- Check storage usage
- Review slow queries

### Vercel Dashboard
- View deployment logs
- Monitor function execution time
- Check error rates
- Review usage metrics

## Next Steps

1. ✅ Database and API are set up
2. ✅ App deployed to Vercel
3. ⬜ Add proper authentication
4. ⬜ Implement rate limiting
5. ⬜ Add request logging
6. ⬜ Set up monitoring alerts
7. ⬜ Configure automated backups
8. ⬜ Add caching layer
9. ⬜ Implement pagination

## Resources

- **Neon Docs**: https://neon.tech/docs
- **Vercel Docs**: https://vercel.com/docs
- **Project README**: [README.md](./README.md)
- **Quick Start**: [QUICKSTART.md](./QUICKSTART.md)
- **Full Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
