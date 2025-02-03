import express from 'express';
import { authenticate, authorize } from '../../middleware/authMiddleware';
import { getHistories } from './controllers';

const router = express.Router();

router.get('/', authenticate, authorize, getHistories);

export default router;
