# MEAN School Management System (RBAC)

Production-ready school management system built with **MongoDB + Express + Angular + Node**, with strict Role-Based Access Control (RBAC), JWT authentication, and full CRUD for teachers, students, subjects, grades, and marks.

## Project overview

- **Admin**: Manage teachers and students (add, edit, delete, section for students), subjects, grades (classes), and assignments. User list with search and pagination.
- **Teacher**: View assigned grades and students; assign/update marks (0–100). Marks table shows Section and Letter Grade. Grades are calculated in the backend.
- **Student**: View own marks (Subject, Marks, Grade) and a performance summary (average score, grade breakdown). Data is scoped to the logged-in student only.

All actions persist in MongoDB; no placeholder or fake UI.

## Architecture

- **Backend**: Node.js + Express. REST API with JWT auth, bcrypt password hashing, Mongoose models, Zod validation, centralized error handling, and RBAC middleware.
- **Frontend**: Angular (standalone components) + Angular Material. Auth and role guards protect routes; HTTP interceptor attaches the JWT. Theme: Primary #1E3A8A, Accent #10B981, Background #F3F4F6.
- **Database**: MongoDB (local or Atlas). Models: User (with optional `section` for students), Role, Subject, Grade (class/level), Mark (marks 0–100 + `letterGrade` A+–F).

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

## Grading logic (backend only)

Letter grade is **calculated only in the backend** (see `backend/src/utils/grading.ts`). Marks (0–100) are converted as follows:

| Marks  | Letter grade |
|--------|--------------|
| 95–100 | A+           |
| 90–94  | A            |
| 85–89  | B+           |
| 80–84  | B            |
| 75–79  | C+           |
| 70–74  | C            |
| 60–69  | D            |
| 50–59  | E            |
| 0–49   | F            |

On create/update of a mark, the API computes and stores `letterGrade`; teacher and student APIs return it. Student performance summary (average, breakdown by letter grade) is served by `GET /api/student/performance`.

## Local setup

### 1) MongoDB

Use either:

- Local MongoDB (Community Server), or  
- **MongoDB Atlas** (create cluster, get connection string).

### 2) Backend

```bat
cd backend
copy .env.example .env
```

Edit `.env` and set:

- `MONGODB_URI` — MongoDB connection string (e.g. Atlas or `mongodb://localhost:27017/mean-school`)
- `JWT_SECRET` — Long random string (e.g. 32+ chars)
- `CORS_ORIGIN` — Frontend origin (e.g. `http://localhost:4200` for dev)

Then:

```bat
npm install
npm run seed
npm run dev
```

Backend runs at `http://localhost:4000`.

### 3) Frontend

```bat
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:4200`. Set `apiBaseUrl` in `src/environments/environment.ts` if your backend URL differs.

## Environment variables

| Variable      | Description |
|---------------|-------------|
| `MONGODB_URI` | MongoDB connection string (required). |
| `JWT_SECRET`  | Secret for signing JWTs (required).   |
| `PORT`        | Server port (default 4000).          |
| `CORS_ORIGIN` | Allowed origin for CORS (e.g. frontend URL). |

No hardcoded secrets; use `.env` and keep it out of version control.

## Sample accounts (seeded by `npm run seed`)

**Test accounts (bcrypt-hashed):**

| Role    | Email               | Password    |
|--------|----------------------|-------------|
| Admin  | admin@school.com     | Admin123!  |
| Teacher| teacher@school.com  | Teacher123!|
| Student| student@school.com  | Student123!|

**Preloaded Ethiopian students** (with section, subject, marks, and auto-calculated letter grade):

- Abel Tesfaye – Section A – 88 (B+)
- Hana Mekonnen – Section B – 94 (A)
- Dawit Alemu – Section A – 72 (C)
- Bethlehem Girma – Section C – 67 (D)
- Samuel Bekele – Section B – 53 (E)
- Eden Tadesse – Section A – 98 (A+)
- Natnael Fikru – Section C – 45 (F)
- Ruth Haile – Section B – 81 (B)

Each is assigned to the seeded grade/subject and has marks stored in MongoDB with `letterGrade` set by the backend.

## API overview

- **Auth**: `POST /api/auth/login` (email, password) → JWT.
- **Admin**: `GET/POST/PATCH/DELETE /api/admin/users`, `GET/POST/DELETE /api/admin/subjects`, `GET/POST/DELETE /api/admin/grades`, `PUT /api/admin/grades/:id/assign`.
- **Teacher**: `GET /api/teacher/grades`, `GET /api/teacher/grades/:gradeId/students`, `POST /api/teacher/marks`.
- **Student**: `GET /api/student/marks`, `GET /api/student/performance`.

## Deployment

- **Backend**: e.g. Render or Railway. Set `MONGODB_URI`, `JWT_SECRET`, and `CORS_ORIGIN` (frontend URL). Use the backend URL in frontend env.
- **Frontend**: e.g. Vercel or Netlify. Set `apiBaseUrl` in `environment.prod.ts` to the deployed backend URL. Use SPA redirects (e.g. `_redirects` or `vercel.json`) for client-side routing.
- **Database**: MongoDB Atlas (recommended for production).

After deployment, use the same seed logic or create the three test accounts and run seed once against the production DB if desired.

## Testing

### Backend (Jest)

```bat
cd backend
set NODE_ENV=test
npm test
```

### Frontend (Cypress E2E)

Start MongoDB, backend, and frontend, then:

```bat
cd frontend
npm run cypress:install
npm run e2e:open
```

Or headless: `npm run e2e:run`.

**Verification checklist:** Login as Admin, Teacher, and Student; add/edit/delete user (with section); assign and update marks; confirm letter grades and student performance summary; confirm role restrictions and validation.

## Audit summary (what was fixed)

- **Backend**: Added `utils/grading.ts` (marks → letter grade); `User.section`; `Mark.letterGrade`; teacher/student routes return `letterGrade` and (for teacher) populated student `section`; admin PATCH user (including section); student GET `/performance` (average, breakdown); seed extended with 8 Ethiopian students and marks with grades.
- **Frontend**: Admin: Edit user (dialog), section on create/list, search and pagination on user list. Teacher: Section and Grade columns in marks table. Student: Letter grade column and performance summary card (average, grade breakdown). Theme updated to Primary #1E3A8A, Accent #10B981, Background #F3F4F6. MatDialog and MatPaginator wired; no fake UI.
- **README**: Project overview, architecture, folder structure, setup, env vars, RBAC, grading logic, sample accounts, deployment, testing, and this audit summary.

For the full audit report and detailed fix list, see **AUDIT.md**.
#   S i m p l e - S c h o o l - M a n a g e m e n t - S y s t e m  
 