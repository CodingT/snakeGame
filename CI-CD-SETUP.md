# CI/CD Pipeline Setup Guide

This guide explains how to set up the GitHub Actions CI/CD pipeline to automatically test and deploy your Snake Game to Render.

## 📋 Overview

The pipeline has 4 jobs that run sequentially:

1. **Test Backend** - Runs Python/FastAPI tests with PostgreSQL
2. **Test Frontend** - Runs Next.js build and linting
3. **Build Docker** - Builds the unified Docker image
4. **Deploy to Render** - Triggers deployment to Render

## 🚀 Setup Instructions

### Step 1: Set Up Render

1. **Create a Render Account**
   - Go to https://render.com
   - Sign up or log in

2. **Create a PostgreSQL Database**
   - Click "New +" → "PostgreSQL"
   - Name: `snakegame-db`
   - Plan: Free (or your preferred plan)
   - Click "Create Database"
   - **Save the Internal Database URL** (starts with `postgresql://`)

3. **Create a Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name:** `snakegame`
     - **Environment:** Docker
     - **Region:** Choose closest to you
     - **Branch:** `main` (or `master`)
     - **Dockerfile Path:** `./Dockerfile`
     - **Docker Build Context Directory:** `.`
   
4. **Configure Environment Variables**
   Add these in the Render dashboard under "Environment":
   ```
   DATABASE_URL=<your-postgres-internal-url>
   PYTHONUNBUFFERED=1
   NEXT_PUBLIC_API_URL=/api
   PORT=80
   ```

5. **Get Your Render API Key**
   - Go to Account Settings → API Keys
   - Click "Create API Key"
   - **Save this key** (you'll need it for GitHub)

6. **Get Your Service ID**
   - Go to your web service dashboard
   - The URL will be: `https://dashboard.render.com/web/srv-XXXXX`
   - Copy the `srv-XXXXX` part - this is your Service ID

### Step 2: Configure GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

   **Secret 1:**
   - Name: `RENDER_API_KEY`
   - Value: Your Render API key from Step 1.5

   **Secret 2:**
   - Name: `RENDER_SERVICE_ID`
   - Value: Your Service ID from Step 1.6 (e.g., `srv-xxxxx`)

### Step 3: Push to GitHub

```bash
# Add all files
git add .

# Commit
git commit -m "Add CI/CD pipeline"

# Push to main branch
git push origin main
```

The pipeline will automatically run!

## 🔍 How It Works

### On Every Push/PR:
1. ✅ Backend tests run with PostgreSQL
2. ✅ Frontend builds and lints
3. ✅ Docker image builds (main branch only)

### On Push to Main:
4. 🚀 Automatic deployment to Render

## 📊 Monitoring

### GitHub Actions
- Go to your repo → **Actions** tab
- See all workflow runs
- Click on a run to see detailed logs

### Render Dashboard
- Go to https://dashboard.render.com
- Click on your service
- View deployment logs and status

## 🛠️ Customization

### Run Tests Locally

**Backend:**
```bash
cd backend
uv pip install --system -r pyproject.toml
pytest tests/ -v
pytest tests_integration/ -v
```

**Frontend:**
```bash
cd frontend
npm ci
npm run lint
npm run build
```

### Manual Deployment

Trigger deployment manually:
```bash
curl -X POST "https://api.render.com/v1/services/YOUR_SERVICE_ID/deploys" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## 🔧 Troubleshooting

### Pipeline Fails on Tests

**Backend tests fail:**
- Check PostgreSQL connection in logs
- Verify test database setup
- Run tests locally to debug

**Frontend build fails:**
- Check for TypeScript errors
- Run `npm run build` locally
- Fix any linting issues

### Deployment Fails

**Check Render logs:**
1. Go to Render dashboard
2. Click on your service
3. View "Logs" tab
4. Look for error messages

**Common issues:**
- Missing environment variables
- Database connection errors
- Port configuration issues

**Fix:**
- Verify all environment variables are set
- Check DATABASE_URL is correct
- Ensure PORT=80 is set

### Secrets Not Working

- Verify secret names match exactly (case-sensitive)
- Re-create secrets if needed
- Check GitHub Actions logs for authentication errors

## 🎯 Best Practices

1. **Always test locally first**
   ```bash
   # Run all tests
   cd backend && pytest
   cd ../frontend && npm run build
   ```

2. **Use feature branches**
   ```bash
   git checkout -b feature/my-feature
   # Make changes
   git push origin feature/my-feature
   # Create PR to trigger tests
   ```

3. **Monitor deployments**
   - Check Render dashboard after each deployment
   - Verify app is working at your Render URL

4. **Keep secrets secure**
   - Never commit API keys to git
   - Rotate keys periodically
   - Use GitHub secrets for sensitive data

## 📝 Environment Variables Reference

### Required in Render:
- `DATABASE_URL` - PostgreSQL connection (auto-provided by Render DB)
- `PYTHONUNBUFFERED=1` - Enable Python logging
- `NEXT_PUBLIC_API_URL=/api` - API base URL
- `PORT=80` - Port to listen on

### Optional:
- `SECRET_KEY` - JWT secret (change from default)
- `NODE_ENV=production` - Node environment

## 🔄 Workflow Triggers

The pipeline runs on:
- ✅ Push to `main` or `master` branch
- ✅ Pull requests to `main` or `master`
- ❌ Does NOT run on other branches (unless you create a PR)

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Render Documentation](https://render.com/docs)
- [Render Deploy Hooks](https://render.com/docs/deploy-hooks)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## 🎉 Success!

Once set up, every push to main will:
1. Run all tests automatically
2. Build your Docker image
3. Deploy to Render
4. Your app will be live at: `https://your-service-name.onrender.com`

Happy deploying! 🚀
