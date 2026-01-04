# Deployment Guide - Vercel + Neon Postgres

This guide walks you through deploying Smart Task Manager to Vercel with Neon Postgres database.

## Prerequisites

- [Vercel Account](https://vercel.com/signup)
- [Neon Account](https://console.neon.tech/signup)
- Git repository for your project

## Step 1: Create Neon Database

1. **Sign up/Login to Neon**
   - Go to [Neon Console](https://console.neon.tech)
   - Create a new account or login

2. **Create a New Project**
   - Click "New Project"
   - Choose a project name (e.g., "smart-task-manager")
   - Select a region (choose closest to your users)
   - Click "Create Project"

3. **Get Your Connection String**
   - After creation, you'll see your connection details
   - Copy the "Connection String" - it looks like:
     ```
     postgres://[user]:[password]@[neon_hostname]/[database]?sslmode=require
     ```
   - **Save this securely** - you'll need it for Vercel

4. **Initialize Database Schema**
   - In the Neon console, click on "SQL Editor"
   - Copy the entire contents of `schema.sql` from this repository
   - Paste into the SQL Editor and click "Run"
   - This creates all necessary tables, indexes, and triggers

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Neon Postgres integration"
   git push origin main
   ```

2. **Import Project to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a Vite project

3. **Configure Environment Variables**
   - In the deployment settings, add environment variable:
     - Name: `DATABASE_URL`
     - Value: Your Neon connection string
   - Click "Deploy"

4. **Verify Deployment**
   - Once deployed, click "Visit" to see your live site
   - Test creating a task to verify database connection

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Set Environment Variable**
   ```bash
   vercel env add DATABASE_URL
   ```
   - When prompted, paste your Neon connection string
   - Select "Production", "Preview", and "Development"

4. **Deploy**
   ```bash
   vercel --prod
   ```

## Step 3: Configure Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Create Local Environment File**
   ```bash
   cp .env.example .env
   ```

3. **Add Your Database URL**
   - Open `.env`
   - Add your Neon connection string:
     ```
     DATABASE_URL=postgres://[user]:[password]@[neon_hostname]/[database]?sslmode=require
     ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Step 4: Migrate Existing localStorage Data (Optional)

If you have existing data in localStorage that you want to migrate to the database:

1. **Open Browser Console** on your deployed site or localhost
2. **Set User Email** (temporary auth):
   ```javascript
   localStorage.setItem('taskManager_user', JSON.stringify({
     name: 'Your Name',
     email: 'your@email.com'
   }));
   ```

3. **Import API Utility** (in console):
   ```javascript
   import { migrateLocalStorageToDb } from '/src/utils/api.js';
   ```

4. **Run Migration**:
   ```javascript
   migrateLocalStorageToDb()
     .then(result => console.log('Migration successful:', result))
     .catch(error => console.error('Migration failed:', error));
   ```

## API Endpoints

Your deployed app will have these serverless API endpoints:

### Users
- `GET /api/users?email=user@example.com` - Get or create user
- `PUT /api/users` - Update user name
- `DELETE /api/users?email=user@example.com` - Delete user

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects?id=1` - Get single project
- `POST /api/projects` - Create project
- `PUT /api/projects` - Update project
- `DELETE /api/projects?id=1` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks?id=1` - Get single task
- `GET /api/tasks?projectId=1` - Get tasks by project
- `GET /api/tasks?date=2024-01-01` - Get tasks by date
- `GET /api/tasks?status=completed` - Get tasks by status
- `POST /api/tasks` - Create task
- `PUT /api/tasks` - Update task
- `DELETE /api/tasks?id=1` - Delete task

## Authentication Setup

The current implementation uses a simple email-based authentication via the `x-user-email` header. This is a **temporary solution** for development.

### For Production, consider adding:

1. **NextAuth.js** for OAuth providers (Google, GitHub, etc.)
2. **Clerk** for full authentication solution
3. **Auth0** for enterprise authentication
4. **Custom JWT** implementation with secure tokens

## Troubleshooting

### Database Connection Errors
- Verify your `DATABASE_URL` is correct in Vercel environment variables
- Ensure your IP is not blocked by Neon (Neon allows all by default)
- Check Neon project is in "Active" state

### CORS Issues
- The `vercel.json` already includes CORS headers
- If issues persist, check browser console for specific CORS errors

### 404 on API Routes
- Ensure `vercel.json` exists in project root
- Verify API files are in `/api` directory (not `/src/api`)
- Redeploy after adding API routes

### Build Failures
- Check Vercel build logs for specific errors
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

## Monitoring

### Neon Dashboard
- Monitor database queries, connections, and performance
- View query logs and slow queries
- Check storage usage

### Vercel Dashboard
- View deployment logs and build logs
- Monitor serverless function execution time
- Check for errors in function logs

## Scaling Considerations

### Neon Postgres
- **Free Tier**: 0.5 GB storage, 1 compute unit
- **Pro Tier**: Auto-scaling, branching, 200+ GB storage
- Consider upgrading for production apps with >1000 users

### Vercel Serverless Functions
- Each function has 10-second execution limit (Hobby)
- 50s on Pro plan
- Consider Edge Functions for better performance

## Security Best Practices

1. **Never commit `.env` file** (already in `.gitignore`)
2. **Use Vercel environment variables** for production secrets
3. **Enable Neon IP allowlist** for additional security
4. **Implement proper authentication** before production launch
5. **Add rate limiting** to API endpoints
6. **Sanitize user inputs** to prevent SQL injection

## Next Steps

1. ✅ Database and API are set up
2. ✅ App is deployed to Vercel
3. ⬜ Add proper authentication
4. ⬜ Add rate limiting to API endpoints
5. ⬜ Set up monitoring and alerts
6. ⬜ Add automated backups
7. ⬜ Implement caching for better performance

## Support

- **Neon Docs**: https://neon.tech/docs
- **Vercel Docs**: https://vercel.com/docs
- **GitHub Issues**: Open an issue in this repository
