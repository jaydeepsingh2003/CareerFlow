---
description: How to deploy the full KodNestCareers stack locally or to production
---

# Deployment Workflow

This workflow guides you through spinning up the entire AI-native career platform using Docker.

## Prerequisites
- Docker & Docker Compose installed
- 16GB+ RAM (recommended for AI services)

## Steps

### 1. Environment Setup
Ensure your `.env` files are configured in both the root and `backend` directories.
Notably, `JWT_SECRET` and `DATABASE_URL` are required.

### 2. Full Stack Build
// turbo
```bash
docker-compose build
```

### 3. Start Services
// turbo
```bash
docker-compose up -d
```

### 4. Database Setup
Once Postgres is up, run the migrations:
// turbo
```bash
docker-compose exec backend npx prisma db push
```

### 5. Verify Health
Check if all services are responding:
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:3001/health](http://localhost:3001/health)
- AI Docs: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

### 6. AI Model Initialization (Optional)
If using local Ollama, you may need to pull the models:
```bash
docker-compose exec ollama ollama pull llama3
```

## Troubleshooting
- **Port Conflicts**: Ensure ports 3000, 3001, 5432, 6379, and 6333 are free.
- **Memory**: AI services (Ollama/Qdrant) can be resource-intensive. Check Docker resource limits.
