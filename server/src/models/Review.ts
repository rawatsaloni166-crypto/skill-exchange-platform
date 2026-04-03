import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IReview extends Document {
  request: Types.ObjectId;
  reviewer: Types.ObjectId;
  reviewee: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    request: { type: Schema.Types.ObjectId, ref: 'Request', required: true },
    reviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reviewee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
  },
  { timestamps: true }
);

const Review: Model<IReview> = mongoose.model<IReview>('Review', reviewSchema);
export default Review;
