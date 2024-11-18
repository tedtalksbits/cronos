import axios from 'axios';
import logger from './logger';

export interface WebhookPayload {
  event: 'job_started' | 'job_succeeded' | 'job_failed';
  jobName: string;
  jobId: string;
  userId: string;
  timestamp: Date;
}
export const triggerWebhook = async (url: string, payload: WebhookPayload) => {
  try {
    await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(`Webhook sent successfully to ${url}`);
    logger.info(`Webhook sent successfully to ${url}`);
  } catch (error) {
    logger.error(`Failed to send webhook to ${url}:`, error.message);
    console.error(`Failed to send webhook to ${url}:`, error.message);
  }
};
