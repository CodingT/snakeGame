# Snake Game - Docker Deployment

This project is fully containerized using Docker Compose with PostgreSQL, FastAPI backend, Next.js frontend, and Nginx reverse proxy.

## Architecture

```
┌─────────────────────────────────────────┐
│           Nginx (Port 80)               │
│  - Proxies /api/* to backend            │
│  - Proxies /* to frontend               │
└─────────────────────────────────────────┘
           │                    │
           ▼                    ▼
┌──────────────────┐  ┌──────────────────┐
│  Backend (8000)  │  │ Frontend (3000)  │
│    FastAPI       │  │    Next.js       │
└──────────────────┘  └──────────────────┘
           │
           ▼
┌──────────────────┐
│  PostgreSQL DB   │
│    (Port 5432)   │
└──────────────────┘
```

## Quick Start

### Prerequisites
- Docker
- Docker Compose

### Running the Application

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

2. **Access the application:**
   - **Frontend (via Nginx):** http://localhost
   - **Backend API (via Nginx):** http://localhost/api
   - **Direct Backend Access:** http://localhost:8000
   - **Direct Frontend Access:** http://localhost:3000

3. **View logs:**
   ```bash
   # All services
   docker-compose logs -f

   # Specific service
   docker-compose logs -f backend
   docker-compose logs -f frontend
   docker-compose logs -f db
   ```

4. **Stop all services:**
   ```bash
   docker-compose down
   ```

5. **Stop and remove volumes (clean slate):**
   ```bash
   docker-compose down -v
   ```

## Development vs Production

### Development (Current Setup)
- Backend runs with `--reload` for hot reloading
- Frontend runs in development mode
- Database data persists in Docker volume

### Production Recommendations
1. Remove `--reload` from backend command in `docker-compose.yml`
2. Set `NODE_ENV=production` for frontend
3. Use environment variables for secrets (not hardcoded)
4. Add SSL/TLS certificates to Nginx
5. Configure proper CORS origins

## Environment Variables

### Backend
- `DATABASE_URL`: PostgreSQL connection string
- `PYTHONUNBUFFERED`: Enable Python output buffering

### Frontend
- `NEXT_PUBLIC_API_URL`: API base URL (defaults to `/api` in production)

## Database

### PostgreSQL Credentials
- **User:** `snakegame`
- **Password:** `snakegame_password`
- **Database:** `snakegame`
- **Port:** `5432`

### Connecting to Database
```bash
docker-compose exec db psql -U snakegame -d snakegame
```

### Database Migrations
The backend automatically creates tables on startup. For production, consider using Alembic:

```bash
# Generate migration
docker-compose exec backend alembic revision --autogenerate -m "description"

# Apply migration
docker-compose exec backend alembic upgrade head
```

## Rebuilding Images

After code changes:

```bash
# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Rebuild and restart
docker-compose up -d --build

# Force rebuild without cache
docker-compose build --no-cache
```

## Troubleshooting

### Backend won't start
- Check database is healthy: `docker-compose ps`
- View backend logs: `docker-compose logs backend`
- Verify DATABASE_URL is correct

### Frontend build fails
- Clear node_modules: `docker-compose build --no-cache frontend`
- Check for TypeScript errors in logs

### Database connection issues
- Ensure db service is running: `docker-compose ps db`
- Check health status: `docker-compose exec db pg_isready -U snakegame`

### Port conflicts
If ports 80, 3000, 8000, or 5432 are already in use, modify the port mappings in `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Change host port (left side)
```

## Testing

Run backend tests in container:
```bash
docker-compose exec backend pytest
docker-compose exec backend pytest tests_integration/
```

## Monitoring

### Health Checks
- Database: `docker-compose exec db pg_isready -U snakegame`
- Backend: `curl http://localhost:8000/`
- Frontend: `curl http://localhost:3000/`

### Resource Usage
```bash
docker stats
```

## Cleanup

Remove all containers, networks, and volumes:
```bash
docker-compose down -v
docker system prune -a
```
