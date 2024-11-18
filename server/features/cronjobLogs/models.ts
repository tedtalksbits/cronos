// cronjobLogs/models.ts
import mongoose, { Document, Schema } from 'mongoose';

interface ICronJobLog extends Document {
  cronJob: string; // Reference to the associated CronJob
  executedAt: Date; // Time of execution
  status: 'Success' | 'Failure'; // Execution status
  duration: number; // Duration in milliseconds
  user: string; // Reference to the user who executed the job
  stdout?: string; // Standard output
  stderr?: string; // Standard error
  stdin?: string; // Standard input
  error?: string; // Error message
  commandExecuted?: string; // Command executed
}

const cronJobLogSchema: Schema = new mongoose.Schema(
  {
    cronJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CronJob',
      required: true,
    },
    executedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['Success', 'Failure'], required: true },
    duration: { type: Number, required: true }, // Store duration in milliseconds
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    stdout: { type: String },
    stderr: { type: String },
    stdin: { type: String },
    commandExecuted: { type: String },
  },
  { timestamps: true }
);

// we need to limit the number of logs stored in the database we want to keep a rolling log of the last 100 executions for each job
// To achieve this, we can use a pre-save hook to remove the oldest log when a new log is created
// const CronJobLog = mongoose.model<ICronJobLog>('CronJobLog', cronJobLogSchema);

// cronJobLogSchema.pre('save', async function (next) {
//   const log = this as unknown as ICronJobLog;
//   const logs = await CronJobLog.find({ jobId: log.jobId }).sort({ executedAt: 1 });

//   if (logs.length >= 100) {
//     await logs[0].deleteOne();
//   }

//   next();
// });
const CronJobLog = mongoose.model<ICronJobLog>('CronJobLog', cronJobLogSchema);
// Middleware to maintain a maximum of 100 logs for each job
// cronJobLogSchema.pre('save', async function (next) {
//   console.log('Pre save hook');
//   const log = this as unknown as ICronJobLog;

//   // Find the job logs for the current job
//   const logsCount = await CronJobLog.countDocuments({ jobId: log.jobId });

//   console.log('Logs count:', logsCount);

//   // If there are already 100 logs, remove the oldest
//   if (logsCount >= 100) {
//     console.log('Removing oldest log');
//     const oldestLog = await CronJobLog.findOne({ jobId: log.jobId }).sort({
//       executedAt: 1,
//     });
//     if (oldestLog) {
//       console.log('Deleting log:', oldestLog._id);
//       await oldestLog.deleteOne();
//     }
//   }

//   next();
// });
// cronJobLogSchema.pre('save', async function (next) {
//   console.log('Pre save hook');
//   const log = this as unknown as ICronJobLog;

//   // Find the job logs for the current job
//   const logsCount = await CronJobLog.countDocuments({ jobId: log.jobId });

//   console.log('Logs count:', logsCount);

//   // If there are already 100 logs, remove the oldest
//   if (logsCount >= 19) {
//     console.log('Removing oldest log');
//     const oldestLog = await CronJobLog.findOne({ jobId: log.jobId }).sort({
//       executedAt: 1,
//     });
//     if (oldestLog) {
//       console.log('Deleting log:', oldestLog._id);
//       await oldestLog.deleteOne();
//       console.log('Log deleted successfully.');
//     } else {
//       console.log('No oldest log found to delete.');
//     }
//   } else {
//     console.log('Log count is below the threshold, no deletion required.');
//   }

//   next();
// });
export default CronJobLog;
