# CareerFlow - AI-Powered Job Application Platform

Your intelligent career partner that helps you optimize your resume, match with relevant jobs, and prepare for interviews with simple, clear insights.

## 🚀 Key Features

### Core Tools
- **Smart Resume Analysis** - Get an instant score and easy tips to improve your resume.
- **Job Matching** - See jobs that fit your skills perfectly.
- **Interview Prep** - Get simple tips and practice for different interview rounds.
- **Career Readiness** - See how ready you are for your next job.
- **Skills Checklist** - Find out which simple skills you need to add.

### Technical Details
- **Reliable Tech** - Built with modern, stable tools for a fast experience.
- **Easy-to-Use UI** - A clean, beautiful design that works on any device.
- **Clear API** - Easy for developers to understand and use.
- **Simple Database** - Works right away without complex setup.
- **Built-in Smart Services** - Fast responses to help you work quickly.

---

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Git** (for version control)

---

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd kodnest
```

### 2. Install Dependencies

#### Frontend
```bash
npm install
```

#### Backend
```bash
cd backend
npm install
```

### 3. Configure Environment Variables

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

The default `.env` is already configured for Lite Mode (SQLite + Mock AI).

#### Frontend (.env.local)
Already configured at the root:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Initialize Database
```bash
cd backend
npx prisma db push
npm run seed
```

This creates the SQLite database and populates it with sample data.

---

## 🚀 Running the Application

### Start Backend (Terminal 1)
```bash
cd backend
npm run start:dev
```
Backend will run on **http://localhost:3001**

### Start Frontend (Terminal 2)
```bash
npm run dev
```
Frontend will run on **http://localhost:3000**

---

## 🔐 Test Credentials

Use these credentials to log in:

- **Email**: `john.doe@example.com`
- **Password**: `password123`

OR

- **Email**: `jane.smith@example.com`
- **Password**: `password123`

---

## 📚 API Documentation

Once the backend is running, visit:

**Swagger UI**: http://localhost:3001/api/docs

Interactive API documentation with all endpoints, schemas, and the ability to test requests directly.

---

## 🏗️ Project Structure

```
kodnest/
├── app/                    # Next.js app directory (pages & routes)
├── components/             # React components
│   ├── dashboard/         # Dashboard-specific components
│   ├── jobs/              # Job listing components
│   ├── layout/            # Layout components (sidebar, nav)
│   └── resume/            # Resume-related components
├── lib/                   # Utilities and helpers
│   └── api.ts            # Centralized API client
├── backend/               # NestJS backend
│   ├── src/
│   │   ├── auth/         # Authentication module
│   │   ├── jobs/         # Job postings module
│   │   ├── resume/       # Resume analysis module
│   │   ├── matching/     # Job matching logic
│   │   ├── ai/           # AI services (mocked in Lite Mode)
│   │   └── queue/        # Background jobs (mocked)
│   └── prisma/
│       ├── schema.prisma # Database schema
│       └── seed.ts       # Sample data seeder
└── README.md             # This file
```

---

## 🎯 Key Endpoints

### Authentication
- `POST /auth/register` - Create new user account
- `POST /auth/login` - Login and get JWT token

### Jobs
- `GET /jobs` - List all job postings
- `GET /jobs/:id` - Get job details
- `POST /jobs/create` - Create new job posting

### Resume
- `POST /resume/create` - Upload and analyze resume
- `POST /resume/score` - Score resume against job description
- `GET /resume/:id/assessment` - Get ATS assessment

### Profile
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile

### Analytics
- `GET /analytics/dashboard` - Get dashboard statistics

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm run test
```

### E2E Tests
```bash
cd backend
npm run test:e2e
```

---

## 🔧 Development Commands

### Backend
```bash
npm run start:dev      # Start in watch mode
npm run build          # Build for production
npm run start:prod     # Run production build
npm run seed           # Seed database with sample data
npx prisma studio      # Open Prisma Studio (DB GUI)
```

### Frontend
```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run start          # Run production build
npm run lint           # Run ESLint
```

---

## 🎨 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Shadcn UI** - Component library

### Backend
- **NestJS** - Progressive Node.js framework
- **Prisma** - Type-safe ORM
- **SQLite** - Embedded database (Lite Mode)
- **Passport JWT** - Authentication
- **Swagger** - API documentation

### AI Services (Mocked in Lite Mode)
- Resume analysis
- Job matching
- Interview preparation

---

## 📦 Database Schema

### Key Models
- **User** - User accounts with authentication
- **Profile** - User profiles with skills and bio
- **JobPosting** - Job listings with requirements
- **Resume** - Uploaded resumes with parsed content
- **JobMatch** - User-job matches with scores
- **ATSAssessment** - Resume ATS scores and suggestions
- **Skill** - Skills taxonomy
- **ReadinessScore** - Career readiness tracking

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
vercel deploy
```

### Backend (Railway/Render)
```bash
cd backend
npm run build
# Deploy dist/ folder
```

**Note**: For production, consider upgrading to PostgreSQL instead of SQLite.

---

## 🔄 Upgrading from Lite Mode

Currently running in **Lite Mode** (SQLite + Mock AI). To enable full AI features:

1. Set up Docker services (PostgreSQL, Redis, Qdrant, Ollama)
2. Update `backend/.env` with service URLs
3. Restore AI service implementations
4. Update Prisma schema to use PostgreSQL

---

## 🐛 Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Verify `.env` file exists in `backend/`
- Run `npx prisma generate` to regenerate Prisma client

### Frontend won't start
- Check if port 3000 is available
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Database issues
- Delete `backend/prisma/dev.db` and re-run `npx prisma db push`
- Re-seed: `npm run seed`

---

## 📄 License

Private - All Rights Reserved

---

## 👥 Team

Built by the KodNest Team

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- NestJS for the robust backend architecture
- Prisma for the excellent ORM
- Shadcn for beautiful UI components
