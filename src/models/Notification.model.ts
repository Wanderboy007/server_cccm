import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemNotification extends Document {
  userId: mongoose.Types.ObjectId; // Reference to the User who receives the notification
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SystemNotificationSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User model
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<ISystemNotification>('SystemNotification', SystemNotificationSchema);