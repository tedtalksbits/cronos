// scripts/models.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

// Define the Script interface extending Mongoose Document
export interface Script extends Document {
  name: string;
  description: string;
  path: string;
  language: 'bash' | 'python' | 'node' | 'other'; // Customize as needed
  createdBy: Types.ObjectId; // Reference to User model
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Define the Script schema
const scriptSchema: Schema = new mongoose.Schema<Script>(
  {
    name: { type: String, required: true },
    description: { type: String, required: false },
    path: { type: String, required: true }, // Stores the file path on the server
    language: {
      type: String,
      enum: ['bash', 'python', 'node', 'other'],
      required: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags: { type: [String], default: [] }, // Optional tags for categorization
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

// Export the Script model
export default mongoose.model<Script>('Script', scriptSchema);
