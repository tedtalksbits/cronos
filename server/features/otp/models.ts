// otp/models.ts

import mongoose, { Document, Schema } from 'mongoose';
interface OTP extends Document {
  userId: string;
  otp: string;
  expiresAt: Date;
}

const otpSchema: Schema = new mongoose.Schema({
  userId: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, default: Date.now, expires: 600 },
});

export default mongoose.model<OTP>('OTP', otpSchema);
