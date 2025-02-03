import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IHistory extends Document {
  user: Types.ObjectId;
  actionType: 'created' | 'updated' | 'deleted';
  entityId: Types.ObjectId;
  entityType: string;
  diff?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  timestamp: Date;
}

const historySchema: Schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actionType: {
      type: String,
      enum: ['created', 'updated', 'deleted'],
      required: true,
    },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    entityType: { type: String, required: true },
    diff: { type: Object },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IHistory>('History', historySchema);
