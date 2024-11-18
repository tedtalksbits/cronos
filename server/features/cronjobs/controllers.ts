//cronjobs/controllers.ts
import { Request, Response } from 'express';
import parser from 'cron-parser';
import logger from '../../utils/logger';
import { sendRestResponse } from '../../utils/rest';
import { addJob, getJob, removeJob } from '../../utils/jobManager';
import { createCronJobTask } from './services';
import CronJobLog from '../cronjobLogs/models';
import CronJob, { ICronWebhook } from './models';

// region getAllCronJobs
export const getAllCronJobs = async (req: Request, res: Response) => {
  const authUser = req.user;
  if (!authUser) {
    return sendRestResponse({
      status: 401,
      message: 'Unauthorized',
      res,
    });
  }

  try {
    const cronJobs = await CronJob.find();
    return sendRestResponse({
      status: 200,
      message: 'Success',
      data: cronJobs,
      res,
    });
  } catch (error) {
    logger.error(`Error fetching cron jobs: ${error.message}`);
    return sendRestResponse({
      status: 500,
      message: 'Something went wrong, please try again or contact the admin.',
      res,
    });
  }
};
// endregion getAllCronJobs

// region getOneCronJob
export const getOneCronJob = async (req: Request, res: Response) => {
  const authUser = req.user;
  if (!authUser) {
    return sendRestResponse({
      status: 401,
      message: 'Unauthorized',
      res,
    });
  }

  const { id } = req.params;

  if (!id) {
    return sendRestResponse({
      status: 400,
      message: 'Cron job ID is required',
      res,
    });
  }

  try {
    const cronJob = await CronJob.findById(id);
    if (!cronJob) {
      return sendRestResponse({
        status: 404,
        message: 'Cron job not found',
        res,
      });
    }

    return sendRestResponse({
      status: 200,
      message: 'Success',
      data: cronJob,
      res,
    });
  } catch (error) {
    logger.error(`Error fetching cron job: ${error.message}`);
    return sendRestResponse({
      status: 500,
      message: 'Something went wrong, please try again or contact the admin.',
      res,
    });
  }
};
// endregion getOneCronJob

// region createCronJob
export const createCronJob = async (req: Request, res: Response) => {
  const { name, schedule, timezone, command } = req.body;

  // Validate the request body
  if (!name || !schedule || !command) {
    return sendRestResponse({
      status: 400,
      message: 'Name, schedule, and command are required',
      res,
    });
  }

  const requesterIp = req.ip;
  const user = req.user;

  console.log('user', user);
  if (!user) {
    return sendRestResponse({
      status: 401,
      message: 'Unauthorized',
      res,
    });
  }
  // Validate the schedule
  try {
    parser.parseExpression(schedule); // Validate the cron expression
  } catch (err) {
    logger.warn(`Invalid cron schedule: ${schedule} from IP: ${requesterIp}`);
    return sendRestResponse({
      status: 400,
      message: 'Invalid cron schedule',
      res,
    });
  }

  // Create the new CronJob instance
  const newJob = new CronJob({
    user: user.userId,
    name,
    schedule,
    status: 'Active', // Default to 'Active' if no status is provided
    timezone: timezone || 'UTC', // Default to 'UTC' if no timezone is provided
    command,
  });

  try {
    const savedJob = await newJob.save();
    logger.info(
      `Created new cron job: ${savedJob.name} from IP: ${requesterIp}`
    );
    // Schedule the job
    const task = createCronJobTask(savedJob, user.userId);

    // Store the task in the job map
    addJob(savedJob.id, task);

    return sendRestResponse({
      status: 201,
      message: 'Cron job created',
      data: savedJob,
      res,
    });
  } catch (error) {
    logger.error(
      `Error creating cron job: ${error.message} from IP: ${requesterIp}: ${error.message}`
    );
    return sendRestResponse({
      status: 500,
      message: 'Something went wrong, please try again or contact the admin.',
      res,
    });
  }
};
// endregion createCronJob

// region updateCronJob
export const updateCronJob = async (req: Request, res: Response) => {
  const user = req.user;
  const cronJobId = req.params.id;

  if (!cronJobId) {
    return sendRestResponse({
      status: 400,
      message: 'Cron job ID is required',
      res,
    });
  }
  if (!user) {
    return sendRestResponse({
      status: 401,
      message: 'Unauthorized',
      res,
    });
  }

  const { name, schedule, timezone, dependencies, command, status } =
    req.body as {
      name?: string;
      schedule?: string;
      timezone?: string;
      dependencies?: string[];
      command?: string;
      status?: 'Active' | 'Inactive';
    };

  const update = {} as {
    name?: string;
    schedule?: string;
    timezone?: string;
    dependencies?: string[];
    command?: string;
    status?: 'Active' | 'Inactive';
  };

  if (name) update.name = name;
  if (schedule) update.schedule = schedule;
  if (timezone) update.timezone = timezone;
  if (dependencies) update.dependencies = dependencies;
  if (command) update.command = command;
  if (status) update.status = status;

  if (Object.keys(update).length === 0) {
    return sendRestResponse({
      status: 400,
      message: 'No fields to update',
      res,
    });
  }

  try {
    // find current job before updating
    const currentJob = await CronJob.findById({
      _id: cronJobId,
    }).exec();

    // Update the cron job in the database
    const updatedJob = await CronJob.findByIdAndUpdate(
      { _id: cronJobId, user: user.userId },
      update,
      { new: true }
    );

    // If the schedule has changed, update the cron job
    const task = getJob(updatedJob?.id);

    if (currentJob) {
      // stop the old job
      if (task) {
        task.stop();
        // remove the job from the map
        removeJob(currentJob.id);
      }
    }

    // only start a new task if the job is active
    if (updatedJob?.status === 'Active') {
      const newTask = createCronJobTask(updatedJob, user.userId);

      // Store the task in the job map
      addJob(updatedJob.id, newTask);
    }

    return sendRestResponse({
      status: 200,
      message: 'Cron job updated',
      data: updatedJob,
      res,
    });
  } catch (error) {
    logger.error(`Error updating cron job: ${error.message}`);
    return sendRestResponse({
      status: 400,
      message: error.message,
      res,
    });
  }
};
// endregion updateCronJob

// region deleteCronJob
export const deleteCronJob = async (req: Request, res: Response) => {
  const user = req.user;
  const cronJobId = req.params.id;

  if (!cronJobId) {
    return sendRestResponse({
      status: 400,
      message: 'Cron job ID is required',
      res,
    });
  }
  if (!user) {
    return sendRestResponse({
      status: 401,
      message: 'Unauthorized',
      res,
    });
  }
  try {
    const job = await CronJob.findById({
      _id: cronJobId,
    });
    if (job) {
      const task = getJob(job.id);
      if (task) {
        task.stop(); // Stop the cron job
        removeJob(job.id); // Remove the job from the map
      }
      await CronJob.findByIdAndDelete({
        _id: cronJobId,
      });
    }
    return sendRestResponse({
      status: 200,
      message: 'Cron job deleted',
      res,
    });
  } catch (error) {
    logger.error(`Error deleting cron job: ${error.message}`);
    return sendRestResponse({
      status: 400,
      message: error.message,
      res,
    });
  }
};
// endregion deleteCronJob

// region getJobStats
export const getJobStats = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return sendRestResponse({
      status: 401,
      message: 'Unauthorized',
      res,
    });
  }
  const { id } = req.params;

  if (!id) {
    return sendRestResponse({
      status: 400,
      message: 'Cron job ID is required',
      res,
    });
  }
  const requesterIp = req.ip;

  try {
    logger.info(`Fetching stats for job: ${id} from IP: ${requesterIp}`);
    const logs = await CronJobLog.find({ jobId: id, user: user.userId });

    const totalExecutions = logs.length;
    const successCount = logs.filter((log) => log.status === 'Success').length;
    const avgDuration = totalExecutions
      ? logs.reduce((acc, log) => acc + log.duration, 0) / totalExecutions
      : 0;

    const successRate = totalExecutions
      ? (successCount / totalExecutions) * 100
      : 0;

    return sendRestResponse({
      status: 200,
      message: 'Success',
      data: {
        totalExecutions,
        successRate,
        avgDuration,
      },
      res,
    });
  } catch (error) {
    logger.error(
      `Error fetching stats for job: ${id} from IP: ${requesterIp}: ${error.message}`
    );

    return sendRestResponse({
      status: 500,
      message: 'Something went wrong, please try again or contact the admin.',
      res,
    });
  }
};
// endregion getJobStats

// region getCronJobLogs
export const getCronJobLogs = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return sendRestResponse({
      status: 401,
      message: 'Unauthorized',
      res,
    });
  }
  const { id } = req.params;

  if (!id) {
    return sendRestResponse({
      status: 400,
      message: 'Cron job ID is required',
      res,
    });
  }

  // Extract pagination and filter parameters
  const {
    page = 1,
    limit = 50,
    status,
    search,
    sort = '-executedAt',
    fields,
    minDuration,
    maxDuration,
  } = req.query;
  // Convert page and limit to integers
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  try {
    const query: Record<string, any> = { cronJob: id };
    if (status) query.status = status; // Filter by status if provided
    if (minDuration || maxDuration) {
      query.duration = {};
      if (minDuration)
        query.duration.$gte = parseInt(minDuration as string, 10); // Filter by min duration
      if (maxDuration)
        query.duration.$lte = parseInt(maxDuration as string, 10); // Filter by max duration
    }
    if (search) {
      query.$or = [
        { stdout: { $regex: search, $options: 'i' } }, // Search in stdout field
        { stderr: { $regex: search, $options: 'i' } }, // Search in stderr field
        { commandExecuted: { $regex: search, $options: 'i' } }, // Search in message field
        { error: { $regex: search, $options: 'i' } }, // Search in error field
      ];
    }

    const logsQuery = CronJobLog.find(query)
      .populate('cronJob')
      .skip((pageNum - 1) * limitNum) // Skip documents for pagination
      .limit(limitNum) // Limit the number of documents returned
      .sort(sort as string); // Sort by executedAt field

    if (fields) {
      logsQuery.select(fields as string);
    }

    const logs = await logsQuery.exec();

    const totalLogs = await CronJobLog.countDocuments(query);

    return sendRestResponse({
      status: 200,
      message: 'Success',
      data: logs,
      res,
      meta: {
        total: totalLogs,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalLogs / limitNum),
      },
    });
  } catch (error) {
    console.error(`Error fetching logs for job: ${error.message}`);
    logger.error(`Error fetching logs for job: ${id}: ${error.message}`);
    return sendRestResponse({
      status: 500,
      message: 'Something went wrong, please try again or contact the admin.',
      res,
    });
  }
};
// endregion getCronJobLogs

// region createCronJobWebhook
export const createCronJobWebhook = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return sendRestResponse({
      status: 401,
      message: 'Unauthorized',
      res,
    });
  }
  const { id } = req.params;
  const { url, event, secret, description } = req.body;

  if (!url || !event) {
    return sendRestResponse({
      status: 400,
      message: 'URL and event are required',
      res,
    });
  }

  try {
    const job = await CronJob.findById(id);
    if (!job) {
      return sendRestResponse({
        status: 404,
        message: 'Cron job not found',
        res,
      });
    }

    // Check if the webhook already exists
    const existingWebhook = job.webhooks.find(
      (w) => w.url === url && w.event === event
    );
    if (existingWebhook) {
      return sendRestResponse({
        status: 400,
        message: 'Webhook already exists',
        res,
      });
    }

    const newWebhook = {
      url,
      event,
      secret: secret || '',
      description: description || '',
    } as ICronWebhook;

    job.webhooks.push(newWebhook);
    await job.save();

    // update the job in the job map
    const task = getJob(job.id);
    if (task) {
      // stop the old job
      task.stop();

      // remove the job from the map
      removeJob(job.id);
    }

    // only start a new task if the job is active
    if (job.status === 'Active') {
      const newTask = createCronJobTask(job, user.userId);

      // Store the task in the job map
      addJob(job.id, newTask);
    }

    return sendRestResponse({
      status: 201,
      message: 'Webhook added',
      data: job,
      res,
    });
  } catch (error) {
    logger.error(`Error adding webhook: ${error.message}`);
    return sendRestResponse({
      status: 500,
      message: 'Something went wrong, please try again or contact the admin.',
      res,
    });
  }
};
// endregion createCronJobWebhook

// region deleteCronJobWebhook
export const deleteCronJobWebhook = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return sendRestResponse({
      status: 401,
      message: 'Unauthorized',
      res,
    });
  }
  const { id, webhookId } = req.params;

  console.log('id', id);
  console.log('webhookId', webhookId);

  if (!id || !webhookId) {
    return sendRestResponse({
      status: 400,
      message: 'Cron job ID and webhook ID are required',
      res,
    });
  }

  try {
    const job = await CronJob.findById(id);
    if (!job) {
      return sendRestResponse({
        status: 404,
        message: 'Cron job not found',
        res,
      });
    }

    // Check if the webhook exists
    const existingWebhook = job.webhooks.id(webhookId);

    if (!existingWebhook) {
      return sendRestResponse({
        status: 404,
        message: 'Webhook not found',
        res,
      });
    }

    // job.webhooks = job.webhooks.filter(
    //   (w) => w._id?.toString() !== webhookId
    // ) as any;
    existingWebhook.deleteOne();
    await job.save();

    // update the job in the job map
    const task = getJob(job.id);
    if (task) {
      console.log('Stopping task');
      // stop the old job
      task.stop();

      // remove the job from the map
      removeJob(job.id);
    }

    // only start a new task if the job is active
    if (job.status === 'Active') {
      const newTask = createCronJobTask(job, user.userId);

      // Store the task in the job map
      addJob(job.id, newTask);
    }

    return sendRestResponse({
      status: 200,
      message: 'Webhook deleted',
      data: job,
      res,
    });
  } catch (error) {
    logger.error(`Error deleting webhook: ${error.message}`);
    return sendRestResponse({
      status: 500,
      message: 'Something went wrong, please try again or contact the admin.',
      res,
    });
  }
};
// endregion deleteCronJobWebhook

// region updateCronJobWebhook
export const updateCronJobWebhook = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return sendRestResponse({
      status: 401,
      message: 'Unauthorized',
      res,
    });
  }
  const { id, webhookId } = req.params;
  const { url, event, description, secret } = req.body as Partial<ICronWebhook>;

  if (!id || !webhookId || !url || !event) {
    return sendRestResponse({
      status: 400,
      message: 'Cron job ID, webhook ID, URL, and event are required',
      res,
    });
  }

  try {
    const job = await CronJob.findById(id);
    if (!job) {
      return sendRestResponse({
        status: 404,
        message: 'Cron job not found',
        res,
      });
    }

    // Check if the webhook exists
    const existingWebhook = job.webhooks.id(webhookId);

    if (!existingWebhook) {
      return sendRestResponse({
        status: 404,
        message: 'Webhook not found',
        res,
      });
    }

    if (url) existingWebhook.url = url;
    if (event) existingWebhook.event = event;
    if (description) existingWebhook.description = description;
    if (secret) existingWebhook.secret = secret;

    await job.save();

    // update the job in the job map
    const task = getJob(job.id);
    if (task) {
      // stop the old job
      task.stop();

      // remove the job from the map
      removeJob(job.id);
    }

    // only start a new task if the job is active
    if (job.status === 'Active') {
      const newTask = createCronJobTask(job, user.userId);

      // Store the task in the job map
      addJob(job.id, newTask);
    }

    return sendRestResponse({
      status: 201,
      message: 'Webhook updated',
      data: job,
      res,
    });
  } catch (error) {
    logger.error(`Error updating webhook: ${error.message}`);
    return sendRestResponse({
      status: 500,
      message: 'Something went wrong, please try again or contact the admin.',
      res,
    });
  }
};
