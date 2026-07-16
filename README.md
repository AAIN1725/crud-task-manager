# Task Manager

A full-stack CRUD task manager with JWT-based authentication. Users register, log in, and manage personal tasks with status filtering (Active / Completed).

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express 4, TypeScript, Prisma ORM, PostgreSQL |
| Auth | JWT stored in an `httpOnly` cookie (7-day expiry) |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7 |
| HTTP | Axios with `withCredentials: true` |
| Testing | Jest + Supertest (backend), Vitest + React Testing Library (frontend) |

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm 9+

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/AAIN1725/crud-task-manager.git
cd crud-task-manager
```

### 2. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Configure environment variables

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your values:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/taskmanager"
JWT_SECRET="your-long-random-secret-at-least-64-characters"
PORT=8000
NODE_ENV=development
```

### 4. Run database migrations

```bash
cd backend
npm run db:migrate    # creates tables in PostgreSQL
npm run db:generate   # generates the Prisma client
```

### 5. Start the development servers

Open two terminals:

```bash
# Terminal 1 — Backend (http://localhost:8000)
cd backend && npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend && npm run dev
```

The frontend proxies all `/api/*` requests to the backend, so no CORS configuration is needed in development.

## Running Tests

```bash
# Backend (Jest + Supertest — no database required, Prisma is mocked)
cd backend && npm test

# Frontend (Vitest + React Testing Library)
cd frontend && npm test
```

## Project Structure

```
crud-task-manager/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # User and Task models
│   │   └── migrations/
│   └── src/
│       ├── controllers/         # Request/response handlers
│       │   └── auth.controller.ts
│       ├── middleware/
│       │   ├── auth.middleware.ts   # JWT cookie guard
│       │   └── error.middleware.ts
│       ├── routes/
│       │   ├── auth.routes.ts
│       │   └── tasks.ts
│       ├── services/
│       │   ├── auth.service.ts  # bcrypt + JWT helpers
│       │   └── task.service.ts  # Prisma query wrappers
│       └── lib/
│           └── prisma.ts        # Singleton PrismaClient
└── frontend/
    └── src/
        ├── api/                 # Axios API calls
        ├── components/          # TaskCard, TaskForm, FilterBar, Navbar
        ├── context/             # AuthContext (global auth state)
        ├── hooks/               # useTasks (task state + CRUD)
        ├── pages/               # LoginPage, RegisterPage, DashboardPage
        └── types/               # Shared TypeScript interfaces
```

## API Reference

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | No | Create account; sets JWT cookie |
| `POST` | `/login` | No | Authenticate; sets JWT cookie |
| `POST` | `/logout` | No | Clears JWT cookie |
| `GET` | `/me` | Yes | Returns the current user |

**Register / Login body:**
```json
{ "email": "user@example.com", "password": "secret" }
```

### Tasks — `/api/tasks` (all routes require auth cookie)

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | List tasks. Optional `?status=active\|completed` filter |
| `POST` | `/` | Create a task |
| `PUT` | `/:id` | Update title, description, or status |
| `DELETE` | `/:id` | Delete a task |

**Create body:**
```json
{ "title": "Buy groceries", "description": "Optional details" }
```

**Update body** (all fields optional):
```json
{ "title": "Updated title", "description": "Updated desc", "status": "COMPLETED" }
```

Task status values: `ACTIVE` | `COMPLETED`
