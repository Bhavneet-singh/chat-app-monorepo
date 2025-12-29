import http from 'http';
import app from './app.js';
import { connectDB } from './config/database.js';
import { initializeSocket } from './socket/index.js';
import logger from './config/logger.js';

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', err);
  const server = http.createServer(app);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);

initializeSocket(server);

server.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
  });
});

