// cronjobs/models.ts
import mongoose, { Document, Schema, Types } from 'mongoose';
import CronJobLog from '../cronjobLogs/models';

export interface ICronJob extends Document {
  name: string;
  command: string;
  schedule: string;
  status: 'Active' | 'Inactive';
  lastRun: Date | null;
  nextRun: Date | null;
  resourceUsage: 'Low' | 'Medium' | 'High';
  dependencies: string[];
  timezone: string;
  user: string;
  webhooks: Types.DocumentArray<ICronWebhook>;
}

export interface ICronWebhook extends Types.Subdocument {
  url: string;
  description?: string;
  event: 'job_started' | 'job_succeeded' | 'job_failed';
  secret?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const cronWebhookSchema: Schema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    description: { type: String },
    event: {
      type: String,
      enum: ['job_started', 'job_succeeded', 'job_failed'],
      required: true,
    },
    secret: { type: String },
  },
  { timestamps: true }
);

const cronJobSchema: Schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    schedule: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    lastRun: { type: Date, default: null },
    nextRun: { type: Date, default: null },
    command: { type: String, required: true },
    resourceUsage: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low',
    },
    dependencies: { type: [String], default: [] },
    timezone: { type: String, default: 'UTC' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    webhooks: [cronWebhookSchema],
  },
  { timestamps: true }
);

// Middleware to delete all associated logs when a job is deleted
// cronJobSchema.pre('remove', async function (next) {
//   const job = this as unknown as ICronJob;
//   await CronJobLog.deleteMany({ cronJob: job._id });
//   next();
// });

cronJobSchema.post<ICronJob>('findOneAndDelete', async function (doc) {
  const cronJobDoc = doc as unknown as ICronJob;
  if (cronJobDoc) {
    await CronJobLog.deleteMany({ cronJob: cronJobDoc._id });
  }
});

export default mongoose.model<ICronJob>('CronJob', cronJobSchema);
