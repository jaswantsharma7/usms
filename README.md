# University Student Management System (USMS)

A production-grade, full-stack Student Management System built with the MERN stack.

---

## Tech Stack

| Layer      | Technology                                      |
|------------|------------------------------------------------|
| Frontend   | React 18, Redux Toolkit, Tailwind CSS, Vite    |
| Backend    | Node.js, Express.js                            |
| Database   | MongoDB, Mongoose                              |
| Auth       | JWT (access + refresh tokens), bcryptjs        |
| Real-Time  | Socket.IO                                      |
| Charts     | Chart.js, react-chartjs-2                      |
| Deployment | Docker, Nginx, MongoDB Atlas                   |

---

## Features

- **Role-Based Access Control** — Admin, Faculty, Student
- **Authentication** — JWT with refresh tokens, bcrypt hashing, password reset via email
- **Student Management** — CRUD, profiles, avatar upload, academic history
- **Faculty Management** — CRUD, department assignment, course management
- **Course Management** — CRUD, faculty assignment, student enrollment, scheduling
- **Enrollment System** — Enroll/drop courses, duplicate prevention, status tracking
- **Attendance** — Faculty marks attendance per class, student summary with % calculation
- **Grades & Results** — Faculty assigns grades, GPA calculation, transcript generation
- **Timetable** — Weekly schedule with conflict detection
- **Notifications** — In-app notifications + admin announcements, real-time via Socket.IO
- **Dashboards** — Role-specific dashboards with Chart.js visualizations
- **Search & Filtering** — Across students, faculty, courses with pagination

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
- Node.js 18+
- MongoDB (local or Atlas)
- npm

### 1. Clone & Install

```bash
git clone <repo-url>
cd usms
npm run install:all
```

### 2. Configure Environment

```bash
# Server
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI, JWT secrets, email config

# Client
cp client/.env.example client/.env
```

### 3. Run Development

```bash
# Option A: Run both together
npm run dev

# Option B: Run separately
npm run dev:server   # http://localhost:5000
npm run dev:client   # http://localhost:5173
```

### 4. Create Admin User

Register via `/register` and set `role: "admin"` directly in MongoDB, or use the API:

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@usms.edu","password":"Admin@1234","role":"admin"}'
```

---

## API Documentation

Base URL: `http://localhost:5000/api/v1`

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| POST | `/auth/refresh-token` | Refresh access token |
| POST | `/auth/forgot-password` | Send reset email |
| PATCH | `/auth/reset-password/:token` | Reset password |
| GET | `/auth/me` | Get current user |

### Students
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/students` | Admin, Faculty | List all students |
| GET | `/students/me` | Student | My profile |
| GET | `/students/:id` | Admin, Faculty | Student by ID |
| POST | `/students` | Admin | Create student |
| PATCH | `/students/:id` | Admin | Update student |
| DELETE | `/students/:id` | Admin | Delete student |

### Faculty
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/faculty` | All | List faculty |
| GET | `/faculty/me` | Faculty | My profile |
| GET | `/faculty/:id` | Admin, Faculty | Faculty by ID |
| GET | `/faculty/:id/students` | Admin, Faculty | Faculty's students |
| POST | `/faculty` | Admin | Create faculty |
| PATCH | `/faculty/:id` | Admin | Update faculty |
| DELETE | `/faculty/:id` | Admin | Delete faculty |

### Courses
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/courses` | All | List courses |
| GET | `/courses/:id` | All | Course details |
| GET | `/courses/:id/students` | Admin, Faculty | Enrolled students |
| POST | `/courses` | Admin | Create course |
| PATCH | `/courses/:id` | Admin | Update course |
| PATCH | `/courses/:id/assign-faculty` | Admin | Assign faculty |
| DELETE | `/courses/:id` | Admin | Delete course |

### Enrollment
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/enrollments/me` | Student | My enrollments |
| GET | `/enrollments/student/:id` | Admin, Faculty | Student's enrollments |
| GET | `/enrollments/course/:id` | Admin, Faculty | Course enrollments |
| POST | `/enrollments` | Admin, Faculty | Enroll student |
| PATCH | `/enrollments/:id/drop` | Student | Drop course |
| PATCH | `/enrollments/:id/status` | Admin, Faculty | Update status |

### Attendance
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/attendance/me` | Student | My attendance |
| GET | `/attendance/me/summary` | Student | Attendance summary |
| GET | `/attendance/course/:id` | Admin, Faculty | Course attendance |
| GET | `/attendance/student/:id` | Admin, Faculty | Student attendance |
| POST | `/attendance/mark` | Faculty, Admin | Mark attendance |

### Grades
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/grades/me` | Student | My grades |
| GET | `/grades/me/transcript` | Student | Full transcript |
| GET | `/grades/course/:id` | Admin, Faculty | Course grades |
| POST | `/grades/assign` | Faculty, Admin | Assign grade |
| PATCH | `/grades/course/:id/publish` | Faculty, Admin | Publish grades |

### Timetable
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/timetable/me` | All | My timetable |
| GET | `/timetable` | Admin, Faculty | Full timetable |
| POST | `/timetable` | Admin | Create entry |
| PATCH | `/timetable/:id` | Admin | Update entry |
| DELETE | `/timetable/:id` | Admin | Delete entry |

### Notifications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | All | My notifications |
| PATCH | `/notifications/:id/read` | All | Mark read |
| PATCH | `/notifications/mark-all-read` | All | Mark all read |
| DELETE | `/notifications/:id` | All | Delete |
| POST | `/notifications/announcement` | Admin | Send announcement |

### Dashboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard` | All | Role-based dashboard |

---

## Docker Deployment

```bash
# Build and run
docker-compose up --build -d

# Stop
docker-compose down
```

---

## Deployment

- **Backend**: Render / Railway — set env vars, point to MongoDB Atlas
- **Frontend**: Vercel / Netlify — set `VITE_API_URL` to backend URL
- **Database**: MongoDB Atlas free tier

---

## Architecture

```
Request → Express Router
       → Auth Middleware (JWT verify)
       → Role Middleware (RBAC check)
       → Controller (request/response)
       → Service (business logic)
       → Model (MongoDB via Mongoose)
       → Response

Frontend: Component → dispatch(action) → Redux Slice → API call → Store update → UI re-render
```

---

## Security

- JWT access tokens (15min) + refresh tokens (7 days)
- bcryptjs password hashing (12 rounds)
- Helmet.js security headers
- express-rate-limit (100 req/15min, 10 auth req/15min)
- express-mongo-sanitize (NoSQL injection prevention)
- CORS restricted to client URL
- Input validation with express-validator
- HTTP-only cookies for token storage
