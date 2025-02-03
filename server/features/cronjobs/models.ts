// cronjobs/models.ts
import mongoose, { Document, Schema, Types } from 'mongoose';

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

// pre-save middleware
// cronJobSchema.pre<ICronJob>('save', async function (next) {
//   const cronJobDoc = this as unknown as ICronJob;
//   const cronJobModel = this.constructor as mongoose.Model<ICronJob>;
//   if (cronJobDoc.isNew) {
//     await History.create({
//       user: new mongoose.Types.ObjectId(cronJobDoc.user),
//       actionType: 'created',
//       entityId: cronJobDoc._id,
//       entityType: 'CronJob',
//     });
//   } else {
//     const original = await cronJobModel.findById(cronJobDoc._id);
//     const diff = getDiffHistory(original, cronJobDoc);

//     if (diff) {
//       await History.create({
//         user: new mongoose.Types.ObjectId(cronJobDoc.user),
//         actionType: 'updated',
//         entityId: cronJobDoc._id,
//         entityType: 'CronJob',
//         diff,
//       });
//     }
//   }
//   next();
// });

// post-update middleware
// cronJobSchema.post<ICronJob>('findOneAndUpdate', async function (doc) {
//   const cronJobDoc = doc as unknown as ICronJob;
//   const cronJobModel = mongoose.model<ICronJob>('CronJob');
//   const original = await cronJobModel.findById(cronJobDoc._id);
//   const diff = getDiffHistory(original, cronJobDoc);

//   await History.create({
//     user: new mongoose.Types.ObjectId(cronJobDoc.user),
//     actionType: 'updated',
//     entityId: cronJobDoc._id,
//     entityType: 'CronJob',
//     diff,
//   });
// });

// post-remove middleware
// cronJobSchema.post<ICronJob>('findOneAndDelete', async function (doc) {
//   const cronJobDoc = doc as unknown as ICronJob;
//   if (cronJobDoc) {
//     await History.create({
//       user: new mongoose.Types.ObjectId(cronJobDoc.user),
//       actionType: 'deleted',
//       entityId: cronJobDoc._id,
//       entityType: 'CronJob',
//     });
//     await CronJobLog.deleteMany({ cronJob: cronJobDoc._id });
//   }
// });

export default mongoose.model<ICronJob>('CronJob', cronJobSchema);
