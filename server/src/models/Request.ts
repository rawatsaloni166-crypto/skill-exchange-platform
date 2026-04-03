import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IRequest extends Document {
  fromUser: Types.ObjectId;
  toUser: Types.ObjectId;
  skillOffered: string;
  skillWanted: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const requestSchema = new Schema<IRequest>(
  {
    fromUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    toUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    skillOffered: { type: String, required: true },
    skillWanted: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'cancelled', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const Request: Model<IRequest> = mongoose.model<IRequest>('Request', requestSchema);
export default Request;
