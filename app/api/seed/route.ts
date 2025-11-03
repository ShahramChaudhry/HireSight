import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Job from '@/lib/models/Job';
import Candidate from '@/lib/models/Candidate';

// POST seed database with sample data
export async function POST() {
  try {
    await connectDB();
    
    // Clear existing data
    await Job.deleteMany({});
    await Candidate.deleteMany({});
    
    // Create sample jobs
    const jobs = await Job.create([
      {
        title: 'Senior Frontend Developer',
        candidateCount: 4,
        postedDate: '3 days ago',
        description: 'Looking for a Senior Frontend Developer with 5+ years experience in React, TypeScript, and modern web technologies. Must have strong understanding of responsive design, performance optimization, and state management. Experience with Next.js, testing frameworks, and CI/CD pipelines preferred.',
      },
      {
        title: 'AI/ML Engineer',
        candidateCount: 0,
        postedDate: '5 days ago',
        description: 'Seeking an experienced AI/ML Engineer with expertise in machine learning algorithms, deep learning, and natural language processing.',
      },
      {
        title: 'Product Designer',
        candidateCount: 0,
        postedDate: '1 week ago',
        description: 'Creative Product Designer needed with strong UX/UI skills and experience in design systems.',
      },
      {
        title: 'DevOps Engineer',
        candidateCount: 0,
        postedDate: '2 weeks ago',
        description: 'DevOps Engineer with expertise in cloud infrastructure, CI/CD pipelines, and container orchestration.',
      },
    ]);
    
    // Create sample candidates for the first job
    await Candidate.create([
      {
        name: 'Sarah Mitchell',
        email: 'sarah.mitchell@email.com',
        phone: '+1 555-0123',
        score: 9.2,
        jobId: jobs[0]._id.toString(),
        scores: {
          technicalSkills: 9.5,
          experience: 9.0,
          education: 8.5,
          projectRelevance: 9.5,
          communication: 9.0,
        },
        summary: 'Strong candidate with 7 years of frontend development experience. Demonstrates exceptional expertise in React, TypeScript, and Next.js, perfectly aligning with job requirements. Has led multiple high-impact projects at established tech companies including scalable e-commerce platforms and SaaS applications. Master\'s degree in Computer Science from a top-tier university. Exhibits excellent communication skills through maintained technical blog and open-source contributions. Experience with testing frameworks (Jest, Cypress) and modern CI/CD pipelines adds significant value.',
        highlights: [
          '7+ years of React and TypeScript experience',
          'Led team of 5 developers on enterprise projects',
          'Master\'s degree in Computer Science',
          'Active open-source contributor (2000+ GitHub stars)',
          'Experience with performance optimization and SEO',
        ],
      },
      {
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        phone: '+1 555-0456',
        score: 8.7,
        jobId: jobs[0]._id.toString(),
        scores: {
          technicalSkills: 9.0,
          experience: 8.5,
          education: 8.0,
          projectRelevance: 9.0,
          communication: 8.5,
        },
        summary: 'Experienced frontend developer with 6 years in React and modern JavaScript frameworks. Strong technical skills with a focus on building scalable applications. Has worked on multiple SaaS products and has experience with Next.js and TypeScript.',
        highlights: [
          '6 years of React experience',
          'Experience with Next.js and TypeScript',
          'Built multiple SaaS products',
          'Strong focus on code quality',
          'Experience with testing and CI/CD',
        ],
      },
      {
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@email.com',
        phone: '+1 555-0789',
        score: 8.4,
        jobId: jobs[0]._id.toString(),
        scores: {
          technicalSkills: 8.5,
          experience: 8.0,
          education: 9.0,
          projectRelevance: 8.5,
          communication: 8.0,
        },
        summary: 'Talented developer with 5 years of experience in React and TypeScript. Strong educational background with a Master\'s in Computer Science. Has worked on various web applications with a focus on user experience.',
        highlights: [
          '5 years of React and TypeScript',
          'Master\'s in Computer Science',
          'Focus on user experience',
          'Experience with modern web tools',
          'Strong problem-solving skills',
        ],
      },
      {
        name: 'James Wilson',
        email: 'james.wilson@email.com',
        phone: '+1 555-0321',
        score: 7.9,
        jobId: jobs[0]._id.toString(),
        scores: {
          technicalSkills: 8.0,
          experience: 7.5,
          education: 7.5,
          projectRelevance: 8.5,
          communication: 8.0,
        },
        summary: 'Solid frontend developer with 4 years of experience. Good understanding of React and TypeScript. Has worked on several web projects and is familiar with modern development practices.',
        highlights: [
          '4 years of frontend development',
          'React and TypeScript skills',
          'Experience with web projects',
          'Familiar with modern dev practices',
          'Team collaboration experience',
        ],
      },
    ]);
    
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with sample data',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

