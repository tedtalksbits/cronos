// cronjobs/services.ts
import cron from 'node-cron';
import { exec } from 'child_process';
import parser from 'cron-parser';

import CronJobLog from '../cronjobLogs/models';
import { ICronJob } from './models';
import logger from '../../utils/logger';
import { getWss } from '../../wsManager';
import { triggerWebhook } from '../../utils/webhooks';

export const createCronJobTask = (job: ICronJob, userId: string) => {
  return cron.schedule(job.schedule, async () => {
    const startTime = Date.now();
    for (const webhook of job.webhooks.filter(
      (w) => w.event === 'job_started'
    )) {
      // Trigger webhook
      triggerWebhook(webhook.url, {
        event: 'job_started',
        jobId: job._id as string,
        jobName: job.name,
        userId: userId,
        timestamp: new Date(),
      });
    }
    try {
      exec(job.command, async (error, stdout, stderr) => {
        const duration = Date.now() - startTime;
        const logData = {
          cronJob: job._id,
          user: userId,
          status: error ? 'Failure' : 'Success',
          duration,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          commandExecuted: job.command,
        };

        const logEntry = await new CronJobLog(logData).save(); // Save log
        // Update job's lastRun and nextRun fields
        job.lastRun = new Date();
        job.nextRun = getNextRun(job.schedule); // Implement this function to calculate the next run time
        await job.save();

        // Trigger webhooks
        for (const webhook of job.webhooks.filter(
          (w) => w.event === 'job_succeeded'
        )) {
          triggerWebhook(webhook.url, {
            event: 'job_succeeded',
            jobId: job._id as string,
            jobName: job.name,
            userId: userId,
            timestamp: new Date(),
          });
        }

        // send message to WebSocket clients
        const wss = getWss();
        wss.clients.forEach((client) => {
          client.send(
            JSON.stringify({
              operation: 'invalidate',
              data: {
                cronJob: job._id,
                status: logEntry.status,
                duration: logEntry.duration,
                executedAt: logEntry.executedAt,
                entity: ['cronJobLogs'],
              },
            })
          );
        });

        if (error) {
          logger.error(`Error executing job ${job.name}:`, error);
        } else {
          logger.info(`Job ${job.name} executed successfully.`);
        }
      });
    } catch (error) {
      for (const webhook of job.webhooks.filter(
        (w) => w.event === 'job_failed'
      )) {
        // Trigger webhook
        triggerWebhook(webhook.url, {
          event: 'job_failed',
          jobId: job._id as string,
          jobName: job.name,
          userId: userId,
          timestamp: new Date(),
        });
      }
      logger.error(`Error executing job ${job.name}: ${error.message}`);
    }
  });
};

// Function to calculate the next run time based on cron schedule
function getNextRun(schedule: string): Date | null {
  try {
    const interval = parser.parseExpression(schedule);
    return interval.next().toDate(); // Get the next run time
  } catch (error) {
    console.error('Invalid cron schedule:', error);
    return null; // Or handle error appropriately
  }
}
