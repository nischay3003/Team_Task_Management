# TaskFlow — Team Task Management App

A full-stack collaborative task management web application where teams can create projects, assign tasks, and track progress in real time.

> **Live Demo:** [https://your-app.railway.app](https://your-app.railway.app)  
> **GitHub:** [https://github.com/yourusername/taskflow](https://github.com/yourusername/taskflow)

---

## Features

- **User Authentication** — Signup and login with JWT-based secure authentication
- **Project Management** — Create projects; creator becomes Admin automatically
- **Role-Based Access** — Admin manages tasks and members; Members update only their assigned tasks
- **Task Management** — Create tasks with title, description, due date, priority (Low/Medium/High), and status (To Do / In Progress / Done)
- **Member Management** — Admins can add/remove members by email
- **Dashboard** — Stats per project: total tasks, tasks by status, tasks per user, overdue tasks
- **Responsive UI** — Clean sidebar layout with dark navigation, stat cards, and task filters

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Axios, React Router v6 |
| Backend | Node.js, Express.js |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JSON Web Tokens (JWT) + bcryptjs |
| Deployment | Railway |

---

## Project Structure

```
taskflow/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # DB models: User, Project, ProjectMember, Task
│   ├── src/
│   │   ├── index.js             # Express app entry point
│   │   ├── middleware/
│   │   │   └── auth.js          # JWT verification middleware
│   │   └── routes/
│   │       ├── auth.js          # POST /signup, POST /login
│   │       ├── projects.js      # CRUD + member management
│   │       ├── tasks.js         # CRUD + status updates
│   │       └── dashboard.js     # Project stats
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api.js               # Axios instance with JWT interceptor
    │   ├── App.jsx              # Routes + PrivateRoute guard
    │   ├── styles.css           # Full app stylesheet
    │   └── pages/
    │       ├── Login.jsx
    │       ├── Signup.jsx
    │       ├── Projects.jsx
    │       └── ProjectDetail.jsx
    ├── index.html
    └── package.json
```

---

## Local Setup

### Prerequisites

- Node.js v18+
- PostgreSQL running locally (or use a cloud DB)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/taskflow.git
cd taskflow
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/taskflow
JWT_SECRET=your_super_secret_key_here
PORT=5000
```

Run database migrations and generate the Prisma client:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Start the backend server:

```bash
npm run dev
```

Backend runs at `http://localhost:5000`

### 3. Frontend setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend/` folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend dev server:

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## API Reference

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/signup` | Register a new user | No |
| POST | `/api/auth/login` | Login and receive JWT | No |

### Projects

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/projects` | List all projects for current user | Yes |
| POST | `/api/projects` | Create a new project | Yes |
| GET | `/api/projects/:id` | Get project details + tasks | Yes |
| POST | `/api/projects/:id/members` | Add a member (Admin only) | Yes |
| DELETE | `/api/projects/:id/members/:userId` | Remove a member (Admin only) | Yes |

### Tasks

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/tasks/project/:projectId` | Get all tasks for a project | Yes |
| POST | `/api/tasks` | Create a task (Admin only) | Yes |
| PUT | `/api/tasks/:id` | Update full task (Admin only) | Yes |
| PATCH | `/api/tasks/:id/status` | Update task status | Yes |
| DELETE | `/api/tasks/:id` | Delete a task (Admin only) | Yes |

### Dashboard

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/dashboard/:projectId` | Get project stats | Yes |

---

## Role-Based Access

| Action | Admin | Member |
|--------|-------|--------|
| View project & tasks | ✅ | ✅ |
| Create / edit / delete tasks | ✅ | ❌ |
| Assign tasks to members | ✅ | ❌ |
| Update status of own tasks | ✅ | ✅ |
| Add / remove members | ✅ | ❌ |
| View dashboard stats | ✅ | ✅ |

> The user who **creates a project** is automatically assigned the **Admin** role for that project. All other invited users join as **Members**.

---

## Deployment on Railway

### 1. Push code to GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/yourusername/taskflow.git
git push -u origin main
```

### 2. Deploy Backend

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
2. Select your repository and choose the `backend/` folder (or root if separate repo)
3. Add a **PostgreSQL** plugin from the Railway dashboard
4. Set environment variables:
   ```
   DATABASE_URL  ← auto-filled by Railway PostgreSQL plugin
   JWT_SECRET    ← your secret string
   PORT          ← 5000
   ```
5. Set the start command:
   ```
   npx prisma generate && npx prisma migrate deploy && node src/index.js
   ```
6. Deploy — Railway gives you a public URL like `https://taskflow-backend.railway.app`

### 3. Deploy Frontend

1. New Service → Deploy from GitHub → select `frontend/` folder
2. Set environment variable:
   ```
   VITE_API_URL=https://taskflow-backend.railway.app/api
   ```
3. Build command: `npm run build`
4. Start command: `npx serve dist`
   - Or install serve: add `"serve": "serve"` to dependencies
5. Deploy — Railway gives you a public URL for the frontend

---

## Environment Variables Summary

### Backend `.env`

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=a_long_random_secret_string
PORT=5000
```

### Frontend `.env`

```env
VITE_API_URL=https://your-backend.railway.app/api
```

---

## Database Schema

```
User
  id, name, email, password, createdAt

Project
  id, name, description, createdAt

ProjectMember
  id, role (ADMIN | MEMBER), userId → User, projectId → Project

Task
  id, title, description, dueDate, priority (LOW | MEDIUM | HIGH)
  status (TODO | IN_PROGRESS | DONE), projectId → Project, assigneeId → User
```

---

## Demo Video
<!-- 
[Watch the 3-minute walkthrough →](https://your-video-link.com) -->

Covers:
1. Signup and login flow
2. Creating a project and adding members
3. Creating and assigning tasks
4. Updating task status as a Member
5. Dashboard stats overview
6. Role-based access demonstration

---

## Author

**Your Name**  
[github.com/yourusername](https://github.com/yourusername)  
[your@email.com](mailto:your@email.com)
