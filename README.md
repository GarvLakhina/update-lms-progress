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
