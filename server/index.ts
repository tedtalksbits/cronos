import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import http from 'http';

import { setWss } from './wsManager';
import logger from './utils/logger';
import cronJobRoutes from './features/cronjobs/routes';
import userRoutes from './features/users/routes';
import CronJob from './features/cronjobs/models';
import scriptRoutes from './features/scripts/routes';
import { createCronJobTask } from './features/cronjobs/services';
import { createServerAdminAccount } from './utils/auth';

dotenv.config();

const app = express();
app.set('trust proxy', 1); // Trust first proxy
// CORS configuration
const corsOptions = {
  origin: ['https://cronos.blake-fam.fun', 'http://localhost:3174'], // Allow this origin to access the resources
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow these methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
};
app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 3005;

// Use routes
app.use('/api/cronJobs', cronJobRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/scripts', scriptRoutes);

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Mongo URI is missing');
  logger.error('Mongo URI is missing');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    logger.info('Connected to MongoDB');
    await createServerAdminAccount();
  })
  .catch((err) => {
    console.log('Error connecting to MongoDB', err);
    logger.error('Error connecting to MongoDB', err);
  });

mongoose.connection.on('error', (err) => {
  console.log('Error connecting to MongoDB', err);
  logger.error('Error connecting to MongoDB', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Disconnected from MongoDB');
  logger.warn('Disconnected from MongoDB');
});

const loadCronJobs = async () => {
  const activeCronJobs = await CronJob.find({ status: 'Active' });

  activeCronJobs.forEach((job, i) => {
    createCronJobTask(job, job.user);
    console.log('Loading cron jobs');
    console.log(
      'Loaded ' +
        Number(i + 1) +
        ' out of ' +
        activeCronJobs.length +
        ' cron jobs'
    );
    console.log(`Cron job ${job.name} scheduled to run at ${job.schedule}`);
  });
};

// Create HTTP server for Express
const server = http.createServer(app);

// Set up WebSocket server using the same server instance
const wss = new WebSocketServer({ server });
setWss(wss);

// Handle WebSocket connection
wss.on('connection', (ws) => {
  console.log('WebSocket connection established');
  ws.on('message', (message) => {
    console.log(`Received message => ${message}`);
  });

  ws.send(
    JSON.stringify({
      operation: 'connection',
      message: 'WebSocket connection established',
    })
  );

  // Send message to client every 5 seconds
  const interval = setInterval(() => {
    ws.send(
      JSON.stringify({ operation: 'message', message: 'Hello from the server' })
    );
  }, 10000);

  // Handle WebSocket disconnection
  ws.on('close', () => {
    console.log('WebSocket connection closed');
    clearInterval(interval);
  });
});

// Start the server
server.listen(PORT, async () => {
  await loadCronJobs();
  console.log(`Server running on port ${PORT}`);
  logger.info(`Server running on port ${PORT}`);
});
