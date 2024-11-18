// middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { sendRestResponse } from '../utils/rest';
import { verifyAuthToken } from '../utils/auth';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1]; // Get token from Bearer token
  const clientIP = req.ip; // Get user IP address
  if (!token) {
    logger.warn(`Unauthorized request from IP: ${clientIP}`);
    return sendRestResponse({
      status: 401,
      message: 'Unauthorized',
      res,
    });
  }

  try {
    const verifiedToken = verifyAuthToken(token);
    req.user = verifiedToken;
    next();
  } catch (error) {
    console.log('error', error);
    logger.warn(
      `Token failed verification in request from IP: ${clientIP} - ${error.message}`
    );
    return sendRestResponse({
      status: 401,
      message: 'Unauthorized',
      res,
    });
  }
};

export const authorize = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  console.log('user', user);
  if (!user) {
    return sendRestResponse({
      status: 401,
      message: 'Unauthorized',
      res,
    });
  }

  if (user.role !== 'Admin' || user.status !== 'Active') {
    return sendRestResponse({
      status: 403,
      message: 'Forbidden',
      res,
    });
  }

  next();
};
