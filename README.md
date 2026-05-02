# USMS — University Student Management System

A full-stack web application for managing students, faculty, courses, attendance, grades, and timetables.

**Stack:** React · Redux Toolkit · Node.js · Express · MongoDB · Socket.IO · Resend

---

## Features

- Role-based access control — Admin, Faculty, Student
- Email verification via OTP (Resend API)
- JWT authentication with access + refresh tokens
- Student & faculty profile management
- Course enrollment system
- Attendance tracking with per-course summaries
- Grades & transcript generation
- Timetable management
- Real-time notifications via Socket.IO

---

## Project Structure

```
usms/
├── server/                   # Node.js + Express API
│   ├── src/
│   │   ├── config/           # DB, JWT config
│   │   ├── models/           # Mongoose models
│   │   ├── controllers/      # Route handlers
│   │   ├── services/         # Business logic
│   │   ├── routes/           # Express routes
│   │   ├── middleware/       # Auth, error, upload, validate
│   │   ├── validators/       # express-validator schemas
│   │   └── utils/            # ApiError, ApiResponse, logger, email, GPA
│   ├── tests/                # Supertest API tests
│   └── uploads/              # Profile images
│
├── client/                   # React + Vite SPA
│   ├── src/
│   │   ├── app/              # Redux store
│   │   ├── features/         # Redux slices (auth, students, faculty, ...)
│   │   ├── components/       # Layout + common UI components
│   │   ├── pages/            # All page components
│   │   ├── routes/           # ProtectedRoute, RoleRoute
│   │   └── services/         # Axios API client, Socket.IO
│   └── public/
│
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB 7+ (local or Atlas)
- A [Resend](https://resend.com) account for email

---

### 1. Clone

```bash
git clone https://github.com/jaswantsharma7/usms.git
cd usms
```

---

### 2. Server setup

```bash
cd server
cp .env.example .env   # fill in your values
npm install
```

**.env minimum required:**

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Random 64-byte hex string |
| `JWT_REFRESH_SECRET` | Random 64-byte hex string |
| `RESEND_API_KEY` | From resend.com/api-keys |
| `EMAIL_FROM` | Verified sender address |
| `CLIENT_URL` | Frontend URL (for OTP emails) |

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### 3. Client setup

```bash
cd ../client
npm install
```

The client proxies `/api` to `http://localhost:5000` in development (configured in `vite.config.js`).

---

### 4. Seed the database

```bash
cd ../server
node src/seed.js
```

Creates 1 admin, 50 faculty, 200 students, 50 courses across 5 departments, timetable, enrollments, grades, and attendance records.

| Role | Email | Password |
|---|---|---|
| Admin | admin@usms.com | Admin@123 |
| Faculty | `<name>.fN@usms.com` | Faculty@123 |
| Student | `<name>.sN@usms.com` | Student@123 |

> **Warning:** seed wipes all existing data.

---

### 5. Run

```bash
# Terminal 1 — backend
cd server && npm start       # or: npm run dev (nodemon)

# Terminal 2 — frontend
cd client && npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/v1

---

## Docker

```bash
cp server/.env.example .env   # fill in values

docker-compose up --build
```

- Frontend: http://localhost
- Backend: http://localhost:5000

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register (sends OTP) |
| POST | `/api/v1/auth/verify-email` | Verify OTP `{ email, otp }` |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/logout` | Logout |
| POST | `/api/v1/auth/refresh-token` | Refresh access token |
| POST | `/api/v1/auth/forgot-password` | Send reset email |
| PATCH | `/api/v1/auth/reset-password/:token` | Reset password |
| GET | `/api/v1/students` | List students (admin/faculty) |
| GET | `/api/v1/students/me` | My student profile |
| GET | `/api/v1/faculty` | List faculty (admin) |
| GET | `/api/v1/courses` | List courses |
| POST | `/api/v1/enrollments` | Enroll in a course |
| GET | `/api/v1/grades/me` | My grades |
| GET | `/api/v1/grades/me/transcript` | My transcript |
| GET | `/api/v1/attendance/me/summary` | My attendance summary |
| GET | `/api/v1/timetable/me` | My timetable |
| GET | `/api/v1/notifications` | My notifications |
| GET | `/api/v1/dashboard` | Dashboard stats |

---

## Roles & Permissions

| Action | Admin | Faculty | Student |
|:---|:---:|:---:|:---:|
| Manage students/faculty | ✅ | — | — |
| Manage courses | ✅ | — | — |
| Mark attendance | ✅ | ✅ | — |
| Enter grades | ✅ | ✅ | — |
| View own grades/attendance | ✅ | ✅ | ✅ |
| Enroll in courses | — | — | ✅ |
| View timetable | ✅ | ✅ | ✅ |

---

## License

MIT
