# 🐍 Snake Game - Full Stack Application

A modern, full-stack Snake game with authentication, leaderboard, and real-time gameplay built with Next.js and FastAPI.

![CI/CD](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI/CD%20Pipeline/badge.svg)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## ✨ Features

- 🎮 **Classic Snake Game** - Smooth gameplay with keyboard controls
- 👤 **User Authentication** - Secure signup/login with JWT
- 🏆 **Global Leaderboard** - Compete with players worldwide
- 💾 **Persistent Storage** - PostgreSQL database
- 🐳 **Docker Ready** - One-command deployment
- 🚀 **CI/CD Pipeline** - Automated testing and deployment

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Beautiful UI components

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM with async support
- **PostgreSQL** - Production database
- **JWT** - Secure authentication

### DevOps
- **Docker** - Containerization
- **GitHub Actions** - CI/CD pipeline
- **Render** - Cloud deployment
- **Nginx** - Reverse proxy

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/snakeGame.git
cd snakeGame

# Start with Docker Compose
docker-compose -f docker-compose.unified.yml up -d

# Access the app
open http://localhost
```

### Local Development

**Backend:**
```bash
cd backend
uv pip install --system -r pyproject.toml
uv run uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 📦 Deployment

### Deploy to Render (One-Click)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Manual Deployment

See detailed guides:
- 📘 [CI/CD Setup Guide](./CI-CD-SETUP.md)
- 🚀 [Render Quick Start](./RENDER-QUICK-START.md)
- 🐳 [Docker Deployment](./DEPLOYMENT.md)

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest tests/ -v
pytest tests_integration/ -v

# Frontend build
cd frontend
npm run build
npm run lint
```

## 📚 Documentation

- [Docker Setup](./DOCKER.md) - Multi-container setup
- [Deployment Guide](./DEPLOYMENT.md) - Cloud deployment
- [CI/CD Setup](./CI-CD-SETUP.md) - GitHub Actions
- [API Documentation](./openapi.yaml) - OpenAPI spec

## 🎮 How to Play

1. **Sign Up** - Create an account
2. **Play** - Use arrow keys or WASD to control the snake
3. **Compete** - Your high scores appear on the leaderboard
4. **Challenge** - Beat other players' scores!

## 🏗️ Architecture

```
┌─────────────────────────────────┐
│   Nginx Reverse Proxy (Port 80)│
│   /api/* → Backend              │
│   /*     → Frontend             │
└─────────────────────────────────┘
         │              │
         ▼              ▼
┌──────────────┐  ┌──────────────┐
│   Backend    │  │   Frontend   │
│   FastAPI    │  │   Next.js    │
│   :8000      │  │   :3000      │
└──────────────┘  └──────────────┘
         │
         ▼
┌──────────────────┐
│   PostgreSQL DB  │
│      :5432       │
└──────────────────┘
```

## 🔧 Environment Variables

### Backend
```env
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db
PYTHONUNBUFFERED=1
SECRET_KEY=your-secret-key
```

### Frontend
```env
NEXT_PUBLIC_API_URL=/api
```



## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [v0.dev](https://v0.dev) and Antigravity
- Deployed on [Render](https://render.com)

---

