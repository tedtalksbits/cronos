import { sendRestResponse } from '../../utils/rest';
import { Request, Response } from 'express';
import fs from 'fs';
export const getServersHealth = async (_req: Request, res: Response) => {
  return sendRestResponse({
    status: 200,
    message: 'Server is healthy',
    res,
    data: {
      status: 'Healthy',
      date: new Date(),
    },
  });
};

// a controller to stream logs
export const streamLogs = async (req: Request, res: Response) => {
  const logFile = './logs/combined.log';
  const fileSize = fs.statSync(logFile).size;

  const { range } = req.headers;
  const start = Number(range?.replace(/\D/g, ''));
  const end = fileSize - 1;

  const chunkSize = end - start + 1;

  res.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': chunkSize,
    'Content-Type': 'text/plain',
  });
};

// // Path to the log file
// const logFilePath = path.join(__dirname, '../logs/combined.log');

// Controller method to get the log file content
export const getLogFileContent = (_req: Request, res: Response): void => {
  fs.readFile('logs/combined.log', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading log file:', err);
      return res.status(500).json({ error: 'Unable to read log file' });
    }
    res.json({ content: data });
  });
};
