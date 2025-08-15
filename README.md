# Update LMS Progress & Notification

Monorepo containing backend (Express + MongoDB + Socket.io + node-cron) and frontend (React).

## Structure
- server/ — Node.js backend
- client/ — React frontend

## Quick Start (Backend)
1. Prereqs: Node 18+, MongoDB running locally
2. Copy env
```
cp server/.env.example server/.env
```
3. Install deps
```
cd server && npm install
```
4. Run (dev)
```
npm run dev
```

Server runs on http://localhost:4000

## Environment
See `server/.env.example` for variables.

## Seed Demo Data
Run the seed script to create a demo user, course, lectures, and assignments:
```
cd server
npm run seed
```
The script prints the created userId. Use it on the client.

## Quick Start (Frontend)
1. Copy env
```
cp client/.env.example client/.env
```
2. Edit `client/.env` and set `VITE_USER_ID` to the user id printed by the seed.
3. Install deps and run
```
cd client
npm install
npm run dev
```
Client runs on http://localhost:5173

Socket.io will connect to the server and receive notifications in real-time once you set `VITE_USER_ID` and click the bell to view them.

## Features
- **User Dashboard**: upcoming lectures/assignments, per-course progress, unread notifications count
- **Notifications**: in-app real-time via Socket.io; cron-based scheduling (24h/1h due, 15m before lecture, missed lecture)
- **Attendance**: present/late/absent inference for live; endpoint to mark attendance
- **Progress Tracking**: auto-updated on attendance/assignment submission

## Commands
- **Backend (from `server/`)**
  - `npm install` — install deps
  - `npm run dev` — start dev server with nodemon
  - `npm start` — start server
  - `npm run seed` — seed demo data (prints `userId`)
- **Frontend (from `client/`)**
  - `npm install` — install deps
  - `npm run dev` — start Vite dev server
  - `npm run build` — production build
  - `npm run preview` — preview production build

## Environment Variables
- **Server (`server/.env`)**
  - `PORT` (default 4000)
  - `MONGO_URI` (default mongodb://127.0.0.1:27017/lms)
  - `CLIENT_ORIGIN` (default http://localhost:5173)
  - `PRESENT_WINDOW_MINUTES` (default 10)
  - `RECORDED_COMPLETE_PERCENT` (default 80)
- **Client (`client/.env`)**
  - `VITE_API_BASE` (default http://localhost:4000)
  - `VITE_USER_ID` (set to seeded user id)

## API Endpoints
Base URL: `http://localhost:4000` (send header `X-User-Id: <userId>`) 
- **GET `/dashboard`** → `{ progress[], upcomingLectures[], upcomingAssignments[], notificationsUnread }`
- **POST `/attendance`** body `{ lectureId, status? }` → marks attendance, infers status when not provided
- **POST `/assignments/:id/submit`** → marks assignment submitted for user and updates progress
- **GET `/notifications`** → `{ items[], unread }`
- **PATCH `/notifications/:id/read`** → mark one as read
- **GET `/health`** → `{ ok: true }`

### cURL examples
```bash
# Dashboard
curl -H "X-User-Id: <userId>" http://localhost:4000/dashboard

# Submit assignment
curl -X POST -H "Content-Type: application/json" -H "X-User-Id: <userId>" \
  http://localhost:4000/assignments/<assignmentId>/submit

# Mark attendance (infer status)
curl -X POST -H "Content-Type: application/json" -H "X-User-Id: <userId>" \
  -d '{"lectureId":"<lectureId>"}' http://localhost:4000/attendance

# Notifications
curl -H "X-User-Id: <userId>" http://localhost:4000/notifications
curl -X PATCH -H "X-User-Id: <userId>" http://localhost:4000/notifications/<id>/read
```

## Socket.io Events
- **Client → Server**: `register` payload `{ userId }` to join personal room `user:<id>`
- **Server → Client**: `notification` payload `{ id, message, type, createdAt }`

## Cron Jobs (node-cron)
- Runs every minute to evaluate and emit:
  - Assignment reminders: due in 24h and 1h
  - Lecture reminders: starts in 15 minutes
  - Missed lecture: if ended and no attendance → mark absent and notify

## Data Models (MongoDB)
- `User { name, email, role, enrolledCourses[] }`
- `Course { title, totalLectures, totalAssignments, totalQuizzes }`
- `Lecture { courseId, title, startTime, duration, recordingUrl? }`
- `Assignment { courseId, title, dueDate }`
- `UserAssignment { userId, assignmentId, status, submittedAt? }`
- `Attendance { userId, lectureId, status: present|late|absent|completed }`
- `Progress { userId, courseId, progressPercentage }`
- `Notification { userId, message, type, scheduledTime, read }`

## Progress Formula
```
progress = (lecturesAttended/totalLectures * 0.5)
         + (assignmentsCompleted/totalAssignments * 0.3)
         + (quizzesCompleted/totalQuizzes * 0.2)
# stored as percentage (0-100)
```

## Development Notes
- **Auth (MVP)**: header `X-User-Id`; replace with JWT later
- **CORS**: allowed origin via `CLIENT_ORIGIN`
- **Rooms**: users join `user:<id>` for targeted emits
- **Seeding**: creates 1 user, 1 course, 3 lectures (one in 15m), 2 assignments (1h & 24h)

## Troubleshooting
- Server cannot connect to Mongo → verify `MONGO_URI`, MongoDB service running
- No notifications arriving → ensure `VITE_USER_ID` set and client connected (check network WS); wait for the next minute tick
- Empty dashboard → run `npm run seed` and use the printed `userId`; confirm `X-User-Id` header
- CORS errors → set `CLIENT_ORIGIN` to your client URL
