import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IFlag extends Document {
  reporter: Types.ObjectId;
  targetType: 'user' | 'request' | 'message';
  targetId: Types.ObjectId;
  reason: string;
  status: 'pending' | 'resolved';
  createdAt: Date;
}

const flagSchema = new Schema<IFlag>(
  {
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['user', 'request', 'message'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
  },
  { timestamps: true }
);

const Flag: Model<IFlag> = mongoose.model<IFlag>('Flag', flagSchema);
export default Flag;
