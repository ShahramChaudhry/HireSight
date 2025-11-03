import mongoose, { Schema, model, models } from "mongoose";

export interface ICandidate {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  score: number;
  jobId: string;
  // ✅ Dynamic scoring: no fixed keys
  scores: Record<string, number>;
  summary: string;
  highlights: string[];
  cvUrl?: string;
  linkedinUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CandidateSchema = new Schema<ICandidate>(
  {
    name: {
      type: String,
      required: [true, "Candidate name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    jobId: {
      type: String,
      required: true,
    },

    // ✅ Replace the fixed 5-field structure with a dynamic Map
    scores: {
      type: Map,
      of: Number,
      default: {},
    },

    summary: {
      type: String,
      required: true,
    },
    highlights: {
      type: [String],
      default: [],
    },
    cvUrl: {
      type: String,
    },
    linkedinUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for optimized queries
CandidateSchema.index({ jobId: 1, score: -1 });
CandidateSchema.index({ email: 1 });

// Prevent overwrite model issues in Next.js hot reload
const Candidate =
  models.Candidate || model<ICandidate>("Candidate", CandidateSchema);

export default Candidate;