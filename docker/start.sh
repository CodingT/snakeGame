#!/bin/bash
set -e

echo "Starting Snake Game Application..."

# Start Nginx in the background
echo "Starting Nginx..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Start Next.js frontend in the background
echo "Starting Next.js frontend..."
cd /app/frontend
HOSTNAME=0.0.0.0 PORT=3000 node server.js &
FRONTEND_PID=$!

# Start FastAPI backend
echo "Starting FastAPI backend..."
cd /app/backend
uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
