// src/models/Resource.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IResource extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  value: number;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    value: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IResource>('Resource', ResourceSchema);