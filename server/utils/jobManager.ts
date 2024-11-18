// jobManager.ts
import cron from 'node-cron';

// Map to hold running jobs
const jobMap: Map<string, cron.ScheduledTask> = new Map();

export const addJob = (id: string, task: cron.ScheduledTask) => {
  jobMap.set(id, task);
};

export const getJob = (id: string) => {
  return jobMap.get(id);
};

export const removeJob = (id: string) => {
  jobMap.delete(id);
};

export const stopJob = (id: string) => {
  const task = jobMap.get(id);
  if (task) {
    task.stop();
    removeJob(id);
  }
};

export const getAllJobs = () => {
  return Array.from(jobMap.entries());
};
