# KodNest Backend - API Server

AI-powered backend for the KodNest Careers platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Initialize database
npx prisma db push

# Seed sample data
npm run seed

# Start development server
npm run start:dev
```

Server runs on **http://localhost:3001**

API Docs: **http://localhost:3001/api/docs**

## 🔐 Test Credentials

- Email: `john.doe@example.com`
- Password: `password123`

## 📁 Project Structure

```
src/
├── auth/          # JWT authentication
├── user/          # User management
├── profile/       # User profiles
├── jobs/          # Job postings
├── resume/        # Resume analysis
├── matching/      # Job matching logic
├── ai/            # AI services (mocked)
├── queue/         # Background jobs (mocked)
├── analytics/     # Dashboard analytics
├── notification/  # User notifications
└── common/        # Shared utilities
```

## 🛠️ Available Scripts

```bash
npm run start:dev    # Development mode with hot reload
npm run build        # Build for production
npm run start:prod   # Run production build
npm run seed         # Seed database
npm run test         # Run tests
npx prisma studio    # Open database GUI
```

## 🗄️ Database

Currently using **SQLite** (Lite Mode) for development.

- Database file: `prisma/dev.db`
- Schema: `prisma/schema.prisma`

### Prisma Commands

```bash
npx prisma generate     # Regenerate Prisma Client
npx prisma db push      # Sync schema to database
npx prisma studio       # Open database GUI
npx prisma migrate dev  # Create migration (for PostgreSQL)
```

## 📚 API Endpoints

### Auth
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login

### Jobs
- `GET /jobs` - List jobs
- `GET /jobs/:id` - Get job details
- `POST /jobs/create` - Create job

### Resume
- `POST /resume/create` - Create resume
- `POST /resume/score` - Score resume vs job

### Profile
- `GET /profile` - Get profile
- `PUT /profile` - Update profile

Full documentation: http://localhost:3001/api/docs

## 🧪 Testing

```bash
npm run test        # Unit tests
npm run test:e2e    # E2E tests
npm run test:cov    # Coverage report
```

## 🔧 Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV=development

# AI Services (Mocked in Lite Mode)
OLLAMA_HOST=http://localhost:11434
QDRANT_URL=http://localhost:6333
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 🎯 Lite Mode vs Full Mode

### Current: Lite Mode ✅
- SQLite database
- Mock AI services
- Mock queue system
- No external dependencies
- Perfect for development

### Full Mode (Optional)
- PostgreSQL database
- Real Ollama AI models
- Redis-backed queues
- Qdrant vector search
- Requires Docker services

## 🐛 Troubleshooting

**Port already in use**
```bash
# Kill process on port 3001 (Windows)
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**Prisma errors**
```bash
# Regenerate client
npx prisma generate

# Reset database
rm prisma/dev.db
npx prisma db push
npm run seed
```

**Module not found**
```bash
# Clear and reinstall
rm -rf node_modules
npm install
```

## 📦 Dependencies

### Core
- `@nestjs/core` - NestJS framework
- `@prisma/client` - Database ORM
- `@nestjs/jwt` - JWT authentication
- `@nestjs/swagger` - API documentation

### Utilities
- `bcrypt` - Password hashing
- `class-validator` - DTO validation
- `zod` - Schema validation

## 🚀 Production Deployment

1. Build the application:
```bash
npm run build
```

2. Set production environment variables

3. Run migrations (if using PostgreSQL):
```bash
npx prisma migrate deploy
```

4. Start the server:
```bash
npm run start:prod
```

## 📄 License

Private - All Rights Reserved
