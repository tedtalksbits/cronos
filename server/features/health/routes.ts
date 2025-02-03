import express from 'express';
import { getLogFileContent, getServersHealth } from './controllers';
import { authenticate, authorize } from '../../middleware/authMiddleware';

const router = express.Router();

router.get('/', getServersHealth);
// router.get('/logs', authenticate, authorize, streamLogs);
router.get('/logs/content', authenticate, authorize, getLogFileContent);

export default router;
