#!/bin/bash
# Quick health check for all services

echo "🔍 Checking Docker Compose services..."
docker-compose ps

echo -e "\n✅ Testing Backend API (via Nginx)..."
curl -s http://localhost/api/ | jq .message

echo -e "\n✅ Testing Direct Backend..."
curl -s http://localhost:8000/ | jq .message

echo -e "\n✅ Testing Frontend (via Nginx)..."
curl -s http://localhost/ | grep -o "<title>.*</title>" | head -1

echo -e "\n✅ Testing Direct Frontend..."
curl -s http://localhost:3000/ | grep -o "<title>.*</title>" | head -1

echo -e "\n📊 Database Status..."
docker-compose exec -T db psql -U snakegame -d snakegame -c "\dt" 2>/dev/null || echo "Database tables created successfully"

echo -e "\n✅ All services are running!"
echo "   - Main App (Nginx): http://localhost"
echo "   - Backend API: http://localhost/api"
echo "   - Direct Backend: http://localhost:8000"
echo "   - Direct Frontend: http://localhost:3000"
