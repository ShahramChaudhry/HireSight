import mongoose, { Schema, model, models } from 'mongoose';

export interface ICriteria {
  _id?: string;
  jobId: string;
  jobDescription: string;
  criteria: {
    id: string;
    name: string;
    weight: number;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

const CriteriaSchema = new Schema<ICriteria>(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    criteria: [
      {
        id: String,
        name: String,
        weight: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Criteria = models.Criteria || model<ICriteria>('Criteria', CriteriaSchema);

export default Criteria;

