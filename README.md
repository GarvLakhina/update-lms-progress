# Update LMS Progress & Notification

Monorepo containing backend (Express + MongoDB + Socket.io + node-cron) and frontend (React).

## Structure
- server/ — Node.js backend
- client/ — React frontend (to be added)

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
