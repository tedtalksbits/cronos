// users/models.ts
import mongoose, { Document, Schema } from 'mongoose';
import History from '../history/models';
import CronJob from '../cronjobs/models';

export interface UserType extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  secret?: string;
  avatar?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  lastLogin?: Date;
  lastFailedLogin?: Date;
  failedLoginAttempts: number;
  status?: 'Active' | 'Inactive' | 'Pending' | 'Locked';
  role?: 'User' | 'Admin' | 'Bot';
  isSuper?: boolean;
}

const userSchema: Schema = new mongoose.Schema<UserType>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    secret: { type: String, default: null },
    avatar: { type: String },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    lastLogin: { type: Date, default: null },
    lastFailedLogin: { type: Date, default: null },
    failedLoginAttempts: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Pending', 'Locked'],
      default: 'Pending',
    },
    role: { type: String, enum: ['User', 'Admin', 'Bot'], default: 'User' },
    isSuper: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Middleware to cascade delete histories when a user is deleted
userSchema.pre('findOneAndDelete', async function (next) {
  const user = this.getQuery()['_id']; // Get user ID being deleted
  if (user) {
    await History.deleteMany({ user }); // Delete all history records linked to this user
    console.log(`Deleted all history records for user ${user}`);
  }
  next();
});

// Middleware to cascade delete CronJobs when a user is deleted
userSchema.pre('findOneAndDelete', async function (next) {
  const user = this.getQuery()['_id']; // Get user ID being deleted
  if (user) {
    await CronJob.deleteMany({ user }); // Delete all cron jobs linked to this user
    console.log(`Deleted all cron jobs for user ${user}`);
  }
  next();
});

// Middleware to set the default avatar before saving
userSchema.pre('save', function (next) {
  if (!this.avatar) {
    const seed = this.email; // Use the email as a seed for uniqueness

    const avatarVariants = [
      { style: 'adventurer', name: 'Adventurer' },
      { style: 'micah', name: 'Micah' },
      { style: 'pixel-art', name: 'Pixel Art' },
      { style: 'bottts', name: 'Bottts' },
      { style: 'avataaars', name: 'Avataaars' },
      { style: 'lorelei', name: 'Lorelei' },
      { style: 'notionists', name: 'Notionists' },
    ];

    // Randomly select an avatar style

    const randomIndex = Math.floor(Math.random() * avatarVariants.length);

    const { style } = avatarVariants[randomIndex];

    // Construct the avatar URL
    const avatarUrl = `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}`;
    this.avatar = avatarUrl; // Set the generated avatar URL
  }
  next();
});

export default mongoose.model<UserType>('User', userSchema);
