import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string; // Values: 'super_admin', 'admin', 'student', 'alumni',
  year?: string;
  profile?:string;
  assigned_roles?: string[];
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['super_admin', 'admin', 'student', 'alumni','teacher'] },
  year: { type: String, enum: ['first_year', 'second_year', 'third_year', 'final_year', 'passed_out'] },
  profile: { type: String, required: false },
  assigned_roles: { type: [String] },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);