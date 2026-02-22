Creaver — School Management (MEAN + RBAC)

A compact school management system built with MongoDB, Express, Angular, and Node.js. It implements JWT authentication, role-based access control (Admin / Teacher / Student), and CRUD operations for users, subjects, grades, and marks. The backend computes letter grades from numeric marks.

Table of contents

- Project overview
- Quick start
- Environment
- Running the app
- Testing
- Deployment
- Project structure

Quick start

Prerequisites:
- Node.js 16+ and npm
- MongoDB (local) or MongoDB Atlas

Backend (development):

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGODB_URI, JWT_SECRET, CORS_ORIGIN, PORT
npm run seed   # optional: seed test accounts and sample data
npm run dev
```

Default backend URL: `http://localhost:4000`

Frontend (development):

```bash
cd frontend
npm install
npm start
```

Default frontend URL: `http://localhost:4200`

If the backend runs at a different URL, update `src/environments/environment.ts` (`apiBaseUrl`).

Environment variables

- `MONGODB_URI` — MongoDB connection string (required)
- `JWT_SECRET` — secret for signing JWTs (required)
- `PORT` — backend port (default 4000)
- `CORS_ORIGIN` — allowed frontend origin (e.g. `http://localhost:4200`)

Keep secrets out of the repo; use `.env` locally and proper secrets in production.

Running tests


Project structure (short)

- `backend/` — Node + Express API
  - `src/config` — env and DB setup
  - `src/middleware` — auth and RBAC
  - `src/models` — Mongoose models
  - `src/routes` — route handlers (auth, admin, teacher, student)
  - `src/utils/grading.ts` — marks → letter grade logic
  - `seed.ts` — creates test accounts and sample data

- `frontend/` — Angular app (Material) with guards, interceptors, and services

- `AUDIT.md` — detailed audit and fixes implemented

API highlights

- `POST /api/auth/login` — returns JWT
- Admin routes: manage users, subjects, grades
- Teacher routes: view assigned grades/students, post marks
- Student routes: view own marks and performance
### Folder structure

```
Creaver/
├── backend/
│   └── src/
│       ├── config/       # env, db
│       ├── middleware/   # auth, rbac
│       ├── models/       # User, Role, Subject, Grade, Mark
│       ├── routes/       # auth, admin, teacher, student
│       ├── utils/        # grading (marks → letter grade), httpErrors
│       ├── app.ts
│       ├── server.ts
│       └── seed.ts       # test accounts + 8 Ethiopian students
├── frontend/
│   └── src/app/
│       ├── core/         # app-config, models, services, guards, interceptors
│       ├── features/     # auth, admin, teacher, student, layouts
│       └── app.routes.ts
├── AUDIT.md              # Full audit report and fix list
└── README.md
```

## RBAC (Role-Based Access Control)

| Role    | Backend enforcement        | Frontend enforcement   | Allowed actions |
|--------|----------------------------|------------------------|------------------|
| Admin  | `requireRole('Admin')`     | Route guard `role: Admin`  | CRUD users (Teacher/Student), subjects, grades; assign teachers/students/subjects to grades. |
| Teacher| `requireRole('Teacher')`    | Route guard `role: Teacher`| View assigned grades; view students and marks; POST marks (only for students in assigned grades). |
| Student| `requireRole('Student')`   | Route guard `role: Student` | GET own marks and performance only. |

- Teachers cannot create/delete users or access admin routes.
- Students see only their own marks and performance.
- JWT is validated on every protected route; passwords are hashed with bcrypt.

