# Development Guide

## 🎯 Getting Started

### First Time Setup
1. Install dependencies for both frontend and backend
2. Set up environment variables
3. Initialize and seed the database
4. Start both servers

See main README.md for detailed instructions.

---

## 🔄 Daily Development Workflow

### Starting Your Day
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
npm run dev
```

### Making Changes

#### Frontend Changes
- Components auto-reload on save
- Check browser console for errors
- Use React DevTools for debugging

#### Backend Changes
- NestJS auto-reloads on save
- Check terminal for compilation errors
- Test endpoints in Swagger UI (http://localhost:3001/api/docs)

---

## 🗄️ Database Management

### View Database
```bash
cd backend
npx prisma studio
```
Opens a GUI at http://localhost:5555

### Reset Database
```bash
cd backend
rm prisma/dev.db
npx prisma db push
npm run seed
```

### Update Schema
1. Edit `backend/prisma/schema.prisma`
2. Run `npx prisma db push`
3. Restart backend server

---

## 🧪 Testing Your Changes

### Manual Testing
1. Use Swagger UI for API testing
2. Test frontend flows in browser
3. Check both success and error cases

### API Testing with Swagger
1. Go to http://localhost:3001/api/docs
2. Click "Authorize" and enter JWT token (from login)
3. Try out endpoints interactively

### Getting a JWT Token
```bash
# Login via Swagger or use curl
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@example.com","password":"password123"}'
```

---

## 🎨 Frontend Development

### Adding a New Page
1. Create file in `app/` directory
2. Add route in Next.js App Router
3. Import and use API client from `lib/api.ts`

### Using the API Client
```typescript
import api from '@/lib/api';

// Example: Fetch jobs
const response = await api.jobs.getAll();
const jobs = await response.json();

// Example: Login
const response = await api.auth.login({
  email: 'user@example.com',
  password: 'password123'
});
```

### Component Structure
```
components/
├── dashboard/    # Dashboard-specific
├── jobs/         # Job-related
├── resume/       # Resume-related
└── layout/       # Shared layout
```

---

## ⚙️ Backend Development

### Adding a New Endpoint

1. **Create/Update Controller**
```typescript
@Post('create')
async create(@Body() dto: CreateDto) {
  return this.service.create(dto);
}
```

2. **Add Service Method**
```typescript
async create(data: CreateDto) {
  return this.prisma.model.create({ data });
}
```

3. **Add DTO**
```typescript
export class CreateDto {
  @IsString()
  name: string;
}
```

4. **Test in Swagger**

### Module Structure
```
src/
├── module-name/
│   ├── module-name.module.ts
│   ├── module-name.controller.ts
│   ├── module-name.service.ts
│   └── dto/
│       └── create-module.dto.ts
```

---

## 🐛 Common Issues & Solutions

### Frontend Issues

**"Cannot connect to API"**
- Check backend is running on port 3001
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for CORS errors

**"Module not found"**
```bash
rm -rf node_modules .next
npm install
```

### Backend Issues

**"Port 3001 already in use"**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**"Prisma Client not generated"**
```bash
cd backend
npx prisma generate
```

**"Database locked"**
- Close Prisma Studio
- Restart backend server

---

## 📝 Code Style

### TypeScript
- Use TypeScript for all new code
- Define interfaces for data structures
- Use async/await over promises

### Naming Conventions
- Components: PascalCase (`JobCard.tsx`)
- Files: kebab-case (`job-card.tsx`)
- Functions: camelCase (`getUserProfile`)
- Constants: UPPER_SNAKE_CASE (`API_URL`)

### Imports
```typescript
// External libraries first
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Internal imports
import api from '@/lib/api';
import { JobCard } from '@/components/jobs/job-card';
```

---

## 🚀 Performance Tips

### Frontend
- Use `use client` only when needed
- Implement proper loading states
- Optimize images with Next.js Image component
- Use React.memo for expensive components

### Backend
- Use database indexes for frequent queries
- Implement pagination for large datasets
- Cache frequently accessed data
- Use DTOs for validation

---

## 📚 Useful Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Tools
- [Prisma Studio](https://www.prisma.io/studio) - Database GUI
- [Swagger UI](http://localhost:3001/api/docs) - API testing
- [React DevTools](https://react.dev/learn/react-developer-tools) - React debugging

---

## 🔐 Security Best Practices

1. **Never commit `.env` files**
2. **Use strong JWT secrets in production**
3. **Validate all user inputs**
4. **Hash passwords with bcrypt**
5. **Implement rate limiting for APIs**
6. **Use HTTPS in production**

---

## 🎯 Next Steps

### Immediate
- [ ] Test all core features
- [ ] Fix any bugs found
- [ ] Add error handling

### Short Term
- [ ] Add more test coverage
- [ ] Implement user feedback
- [ ] Optimize performance

### Long Term
- [ ] Upgrade to full AI mode
- [ ] Add more features
- [ ] Deploy to production

---

## 💡 Tips & Tricks

### Hot Reload Not Working?
- Save the file again
- Check for syntax errors
- Restart the dev server

### Debugging
- Use `console.log` liberally
- Check browser Network tab for API calls
- Use NestJS Logger for backend logs

### Git Workflow
```bash
git checkout -b feature/your-feature
# Make changes
git add .
git commit -m "Add: your feature description"
git push origin feature/your-feature
```

---

## 📞 Getting Help

1. Check this guide first
2. Review main README.md
3. Check API docs in Swagger
4. Search error messages online
5. Ask the team

Happy coding! 🚀
