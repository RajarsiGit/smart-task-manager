# Quick Start Guide

Get Smart Task Manager running with Neon Postgres in 5 minutes!

## 1. Create Neon Database (2 minutes)

1. Go to https://console.neon.tech/signup and create account
2. Click **"New Project"**
3. Name it "smart-task-manager" → Click **"Create Project"**
4. **Copy your connection string** (starts with `postgres://`)
5. Click **"SQL Editor"** → Copy/paste contents of `schema.sql` → Click **"Run"**

## 2. Local Setup (2 minutes)

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Open .env and paste your Neon connection string
# DATABASE_URL=postgres://[your-connection-string]

# Start dev server
npm run dev
```

Open http://localhost:5173 - you're done! 🎉

## 3. Deploy to Vercel (1 minute)

```bash
# Push to GitHub
git add .
git commit -m "Setup complete"
git push

# Go to vercel.com/new
# Import your repo
# Add environment variable:
#   DATABASE_URL = your_neon_connection_string
# Click Deploy
```

That's it! Your app is live.

## Troubleshooting

**"DATABASE_URL is not set" error?**
- Make sure `.env` file exists with `DATABASE_URL=postgres://...`

**Can't connect to database?**
- Copy connection string again from Neon console
- Make sure it includes `?sslmode=require` at the end

**API routes return 404?**
- Ensure `vercel.json` exists in project root
- API files must be in `/api` folder (not `/src/api`)

## What's Next?

- **Add Authentication**: See [DEPLOYMENT.md](./DEPLOYMENT.md#authentication-setup)
- **Migrate localStorage Data**: Check browser console and run migration helper
- **Monitor Database**: Visit Neon dashboard to see queries and performance

## Need Help?

- **Full deployment guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Neon docs**: https://neon.tech/docs
- **Vercel docs**: https://vercel.com/docs
