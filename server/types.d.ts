import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from './utils/auth';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
