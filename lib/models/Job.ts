import mongoose, { Schema, model, models } from 'mongoose';

export interface IJob {
  _id?: string;
  title: string;
  description?: string;
  candidateCount: number;
  postedDate: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    candidateCount: {
      type: Number,
      default: 0,
    },
    postedDate: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Job = models.Job || model<IJob>('Job', JobSchema);

export default Job;

