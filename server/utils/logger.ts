// utils/logger.ts
import winston from 'winston';
import { getWss, WebSocketMessage } from '../wsManager';
import fs from 'fs';
import TransportStream from 'winston-transport';

// Define the log format
const logFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level}]: ${message}`;
});

class WebSocketTransport extends TransportStream {
  log(info: any, callback: () => void) {
    setImmediate(() => this.emit('logged', info as any));
    setImmediate(() => this.emit('logged', info));

    const wss = getWss();
    if (wss) {
      wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
          client.send(
            new WebSocketMessage(info.message, 'log', {
              level: info.level,
              timestamp: info.timestamp,
            }).toJson()
          );
        }
      });
    }

    callback();
  }
}

// Ensure the log directory exists
const logDir = './logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

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
    new WebSocketTransport(), // Log to WebSocket clients
  ],
});

export default logger;
