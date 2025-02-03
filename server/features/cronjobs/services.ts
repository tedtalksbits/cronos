// cronjobs/services.ts
import cron from 'node-cron';
import { exec } from 'child_process';
import parser from 'cron-parser';
import CronJob from './models';
import CronJobLog from '../cronjobLogs/models';
import History from '../history/models';
import { ICronJob } from './models';
import logger from '../../utils/logger';
import { getWss } from '../../wsManager';
import { triggerWebhook } from '../../utils/webhooks';
import { getSystemUserId } from '../../features/serverBot/services';
import { getDiffHistory } from '../../features/history/utils';

export const createCronJobTask = (job: ICronJob, userId: string) => {
  return cron.schedule(job.schedule, async () => {
    // start job
    const startTime = Date.now();
    const systemUserId = await getSystemUserId();

    // await History.create({
    //   user: systemUserId,
    //   actionType: "updated",
    //   entityId: job._id,
    //   entityType: "CronJob",
    //   diff: { status: "job_started", timestamp: new Date() },
    // });

    triggerJobStartedWebhooks(job, userId);
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
        const lastRun = new Date();
        const nextRun = getNextRun(job.schedule);
        const currentJob = await CronJob.findById(job._id).exec();

        const updatedJob = await CronJob.findByIdAndUpdate(
          job._id,
          {
            lastRun: lastRun,
            nextRun: nextRun,
          },
          { new: true }
        ).exec();
        // save history
        await History.create({
          user: systemUserId,
          actionType: 'updated',
          entityId: job._id,
          entityType: 'CronJob',
          diff: getDiffHistory(currentJob, updatedJob),
        });

        if (error) {
          triggerJobFailedWebhooks(job, userId);
          logger.error(`Error executing job ${job.name}:`, error);
        } else {
          triggerJobSucceededWebhooks(job, userId);
          logger.info(`Job ${job.name} executed successfully.`);
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
          client.send(
            JSON.stringify({
              operation: 'invalidate',
              data: {
                cronJob: job._id,
                status: logEntry.status,
                duration: logEntry.duration,
                executedAt: logEntry.executedAt,
                entity: ['history'],
              },
            })
          );
        });
      });
    } catch (error) {
      triggerJobFailedWebhooks(job, userId);
      logger.error(`Error executing job ${job.name}: ${error.message}`);
    }
  });
};

function triggerJobFailedWebhooks(job: ICronJob, userId: string) {
  for (const webhook of job.webhooks.filter((w) => w.event === 'job_failed')) {
    // Trigger webhook
    triggerWebhook(webhook.url, {
      event: 'job_failed',
      jobId: job._id as string,
      jobName: job.name,
      userId: userId,
      timestamp: new Date(),
    });
  }
}

function triggerJobSucceededWebhooks(job: ICronJob, userId: string) {
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
}

function triggerJobStartedWebhooks(job: ICronJob, userId: string) {
  for (const webhook of job.webhooks.filter((w) => w.event === 'job_started')) {
    // Trigger webhook
    triggerWebhook(webhook.url, {
      event: 'job_started',
      jobId: job._id as string,
      jobName: job.name,
      userId: userId,
      timestamp: new Date(),
    });
  }
}

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
