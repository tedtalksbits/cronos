// cronjobs/routes.ts

import {
  createCronJob,
  createCronJobWebhook,
  deleteCronJob,
  deleteCronJobWebhook,
  getAllCronJobs,
  getCronJobLogs,
  getJobStats,
  getOneCronJob,
  updateCronJob,
  updateCronJobWebhook,
} from './controllers';
import express from 'express';
import { authenticate, authorize } from '../../middleware/authMiddleware';

const router = express.Router();

router.get('/', authenticate, getAllCronJobs);
router.get('/:id', authenticate, getOneCronJob);
router.post('/', authenticate, authorize, createCronJob);
router.put('/:id', authenticate, authorize, updateCronJob);
router.delete('/:id', authenticate, authorize, deleteCronJob);
router.get('/:id/stats', authenticate, getJobStats);
router.get('/:id/logs', authenticate, getCronJobLogs);
// webhooks
router.post('/:id/webhooks', authenticate, authorize, createCronJobWebhook);
router.delete(
  '/:id/webhooks/:webhookId',
  authenticate,
  authorize,
  deleteCronJobWebhook
);
router.put(
  '/:id/webhooks/:webhookId',
  authenticate,
  authorize,
  updateCronJobWebhook
);

export default router;
