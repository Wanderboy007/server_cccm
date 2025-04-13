import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  category: string; // seminar, webinar, coding_challenge, cultural, technical
  organizer: mongoose.Types.ObjectId; // Reference to the User who created the event
  registeredUsers: mongoose.Types.ObjectId[]; // Users who registered for the event
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] 
  eventimages: mongoose.Types.ObjectId[];
  thumbnail:string;
  createdAt: Date;
  updatedAt: Date;
}


const EventSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true }, // No enum, can accept any value
    organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User model
    registeredUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Array of User references
    eventimages: [{ type: String }], // Array of S3 image URLs
    thumbnail:{ type: String, required: false },
  },
  { timestamps: true }
);


export default mongoose.model<IEvent>('Event', EventSchema);