# 🚀 Quick Deploy to Render

## One-Click Deploy (Easiest)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

Click the button above and Render will:
- ✅ Create PostgreSQL database
- ✅ Build Docker image
- ✅ Deploy your app
- ✅ Set up environment variables

## Manual Deploy (More Control)

### 1. Create Database
```
New + → PostgreSQL
Name: snakegame-db
Plan: Free
```

### 2. Create Web Service
```
New + → Web Service
Environment: Docker
Dockerfile: ./Dockerfile
```

### 3. Set Environment Variables
```
DATABASE_URL=<from-database>
PYTHONUNBUFFERED=1
NEXT_PUBLIC_API_URL=/api
PORT=80
```

### 4. Deploy!
Click "Create Web Service" and wait ~5 minutes.

## GitHub Actions Setup

### Required Secrets
Add these in GitHub Settings → Secrets:

1. `RENDER_API_KEY` - From Render Account Settings
2. `RENDER_SERVICE_ID` - From service URL (srv-xxxxx)

### Trigger Deployment
```bash
git add .
git commit -m "Deploy to Render"
git push origin main
```

## URLs After Deployment

- **Your App:** `https://snakegame.onrender.com` (or your custom name)
- **API:** `https://snakegame.onrender.com/api/`
- **Dashboard:** https://dashboard.render.com

## Common Commands

```bash
# Check deployment status
curl https://api.render.com/v1/services/YOUR_SERVICE_ID \
  -H "Authorization: Bearer YOUR_API_KEY"

# Trigger manual deploy
curl -X POST https://api.render.com/v1/services/YOUR_SERVICE_ID/deploys \
  -H "Authorization: Bearer YOUR_API_KEY"

# View logs
# Go to dashboard.render.com → Your Service → Logs
```

## Troubleshooting

**Build fails?**
- Check Dockerfile syntax
- Verify all files are committed

**App crashes?**
- Check DATABASE_URL is set
- View logs in Render dashboard
- Ensure PORT=80

**Tests fail in CI?**
- Run tests locally first
- Check GitHub Actions logs
- Fix errors and push again

## Free Tier Limits

- **Web Service:** Spins down after 15 min of inactivity
- **Database:** 90 days, then deleted if inactive
- **Build Time:** 500 build minutes/month

Upgrade to Starter plan ($7/mo) for always-on service!

---

📚 **Full Guide:** See `CI-CD-SETUP.md`
