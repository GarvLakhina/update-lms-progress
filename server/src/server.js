import express from 'express';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { Server as SocketIOServer } from 'socket.io';
import config from './config/env.js';
import { registerSocketHandlers } from './socket/index.js';
import { registerRoutes } from './routes/index.js';
import { registerCronJobs } from './cron/scheduler.js';

const app = express();
app.use(cors({ origin: config.clientOrigin }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ ok: true }));

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: config.clientOrigin },
});

io.on('connection', (socket) => registerSocketHandlers(io, socket));

registerRoutes(app, io);

async function start() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB connected');

    registerCronJobs(io);

    server.listen(config.port, () => {
      console.log(`Server listening on http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
