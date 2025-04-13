import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  eventId: mongoose.Types.ObjectId; // Reference to the Event
  userId: mongoose.Types.ObjectId; // Reference to the User who submitted the feedback
  rating: number; // Rating from 1 to 5
  comment?: string; // Optional comment
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema: Schema = new Schema({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true }, // Reference to the Event model
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User model
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
}, { timestamps: true });

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);