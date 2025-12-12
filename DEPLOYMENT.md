# Unified Deployment Guide

This deployment uses a **single container** that includes:
- FastAPI Backend (port 8000)
- Next.js Frontend (port 3000)  
- Nginx Reverse Proxy (port 80)

Only the database runs in a separate container.

## Quick Start

### Build and Run

```bash
# Build and start
docker-compose -f docker-compose.unified.yml up -d --build

# View logs
docker-compose -f docker-compose.unified.yml logs -f

# Stop
docker-compose -f docker-compose.unified.yml down
```

### Access

- **Application:** http://localhost
- **API:** http://localhost/api

## Architecture

```
┌─────────────────────────────────────┐
│    Unified Container (Port 80)      │
│  ┌───────────────────────────────┐  │
│  │   Nginx (Port 80)             │  │
│  │   - Routes /api/* → Backend   │  │
│  │   - Routes /* → Frontend      │  │
│  └───────────────────────────────┘  │
│  ┌──────────────┐  ┌─────────────┐  │
│  │ Backend:8000 │  │Frontend:3000│  │
│  │   FastAPI    │  │  Next.js    │  │
│  └──────────────┘  └─────────────┘  │
└─────────────────────────────────────┘
              │
              ▼
    ┌──────────────────┐
    │  PostgreSQL DB   │
    │   (Port 5432)    │
    └──────────────────┘
```

## Deployment to Cloud

### Docker Hub

```bash
# Build
docker build -t yourusername/snakegame:latest .

# Push
docker push yourusername/snakegame:latest

# Run anywhere
docker run -d \
  -p 80:80 \
  -e DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db \
  yourusername/snakegame:latest
```

### Cloud Platforms

#### AWS ECS / Fargate
```bash
# Tag for ECR
docker tag snakegame:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/snakegame:latest

# Push to ECR
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/snakegame:latest
```

#### Google Cloud Run
```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/snakegame

# Deploy
gcloud run deploy snakegame \
  --image gcr.io/PROJECT_ID/snakegame \
  --platform managed \
  --port 80 \
  --set-env-vars DATABASE_URL=postgresql+asyncpg://...
```

#### Azure Container Instances
```bash
# Build and push to ACR
az acr build --registry myregistry --image snakegame:latest .

# Deploy
az container create \
  --resource-group myResourceGroup \
  --name snakegame \
  --image myregistry.azurecr.io/snakegame:latest \
  --ports 80 \
  --environment-variables DATABASE_URL=postgresql+asyncpg://...
```

#### DigitalOcean App Platform
```bash
# Push to Docker Hub or DOCR
docker tag snakegame registry.digitalocean.com/myregistry/snakegame
docker push registry.digitalocean.com/myregistry/snakegame

# Deploy via UI or doctl
```

## Environment Variables

Required:
- `DATABASE_URL`: PostgreSQL connection string

Optional:
- `PYTHONUNBUFFERED=1`: Enable Python logging
- `NEXT_PUBLIC_API_URL=/api`: API base URL

## Health Checks

```bash
# Check if app is running
curl http://localhost/api/

# Check database connection
docker-compose -f docker-compose.unified.yml exec app \
  python -c "from app.database import engine; print('DB OK')"
```

## Advantages of Unified Container

✅ **Simpler deployment** - One container instead of three  
✅ **Lower resource usage** - Shared base image layers  
✅ **Easier orchestration** - Fewer moving parts  
✅ **Cost effective** - Single container instance  
✅ **Faster startup** - No inter-container networking delays  

## Disadvantages

❌ **Less scalable** - Can't scale frontend/backend independently  
❌ **Larger image size** - ~500MB vs separate containers  
❌ **Harder to debug** - Multiple processes in one container  

## When to Use

- **Small to medium apps** with moderate traffic
- **Cost-sensitive deployments** (single container pricing)
- **Simple hosting** (Heroku, Railway, Render)
- **Development/staging** environments

## When to Use Separate Containers

- **High traffic** requiring independent scaling
- **Microservices** architecture
- **Kubernetes** deployments
- **Production** with complex requirements

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose -f docker-compose.unified.yml logs app

# Check if processes are running
docker-compose -f docker-compose.unified.yml exec app ps aux
```

### Database connection fails
```bash
# Verify DATABASE_URL
docker-compose -f docker-compose.unified.yml exec app env | grep DATABASE_URL

# Test connection
docker-compose -f docker-compose.unified.yml exec db psql -U snakegame -d snakegame
```

### Nginx not routing correctly
```bash
# Check Nginx config
docker-compose -f docker-compose.unified.yml exec app nginx -t

# View Nginx logs
docker-compose -f docker-compose.unified.yml exec app tail -f /var/log/nginx/error.log
```
