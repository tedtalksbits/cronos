import CronJobLog from '../features/cronjobLogs/models';
import logger from './logger';

// Function to clean up old logs
export const cleanupOldLogs = async (jobId: string) => {
  try {
    const logsCount = await CronJobLog.countDocuments({ jobId });

    if (logsCount > Number(process.env.MAX_CRON_LOGS) || logsCount >= 100) {
      logger.info(
        `Cleaning up logs for job ${jobId}: MAX_CRON_LOGS: ${process.env.MAX_CRON_LOGS} logsCount: ${logsCount}`
      );
      const oldestLog = await CronJobLog.findOne({ jobId }).sort({
        executedAt: 1,
      });
      if (oldestLog) {
        await CronJobLog.deleteOne({ _id: oldestLog._id });
        logger.info(`Deleted oldest log for job ${jobId}: ${oldestLog._id}`);
      }
    }
  } catch (error) {
    logger.error('Error cleaning up logs', error);
  }
};
