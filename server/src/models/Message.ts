import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IMessage extends Document {
  request: Types.ObjectId;
  sender: Types.ObjectId;
  body: string;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    request: { type: Schema.Types.ObjectId, ref: 'Request', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true },
  },
  { timestamps: true }
);

const Message: Model<IMessage> = mongoose.model<IMessage>('Message', messageSchema);
export default Message;
