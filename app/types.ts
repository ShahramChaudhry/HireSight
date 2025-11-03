export interface Job {
  id: string;
  title: string;
  candidateCount: number;
  postedDate: string;
  description?: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  score: number;
  jobId: string;
  scores: {
    technicalSkills: number;
    experience: number;
    education: number;
    projectRelevance: number;
    communication: number;
  };
  summary: string;
  highlights: string[];
  cvUrl?: string;
  linkedinUrl?: string;
}

export interface ScoringCriterion {
  id: string;
  name: string;
  weight: number;
}

export interface LinkedInProfile {
  name: string;
  title: string;
  location: string;
  connections: string;
  score: number;
  scores: {
    skillsMatch: number;
    experience: number;
    education: number;
    recommendations: number;
  };
  summary: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  file: File;
}

