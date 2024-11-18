// utils/logger.ts
import winston from 'winston';

// Define the log format
const logFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Create a Winston logger
const logger = winston.createLogger({
  level: 'info', // Set the default log level
  format: winston.format.combine(winston.format.timestamp(), logFormat),
  transports: [
    new winston.transports.Console(), // Log to console
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error', // Log error level and above to file
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json() // Log in JSON format
      ),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log', // Log all levels to this file
    }),
  ],
});

// Ensure the log directory exists
import fs from 'fs';
const logDir = './logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

export default logger;
