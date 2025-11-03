export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import { analyzeResume, extractCandidateInfo } from '@/lib/ai/gemini';
import connectDB from '@/lib/mongodb';
import Candidate from '@/lib/models/Candidate';
import Job from '@/lib/models/Job';
import Criteria from '@/lib/models/Criteria';

export async function POST(request: NextRequest) {
  console.log("✅ /api/analyze route loaded");
  try {
    const { resumeText, jobId } = await request.json();
    
    if (!resumeText || !jobId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if Gemini API key is set
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not set in environment variables');
      return NextResponse.json(
        { success: false, error: 'AI service not configured. Please add GEMINI_API_KEY to .env.local' },
        { status: 500 }
      );
    }
    
    await connectDB();
    
    // Get job details
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Get job-specific criteria
    const criteriaDoc = await Criteria.findOne({ jobId });
    const jobCriteria = criteriaDoc?.criteria || [
      { name: 'Technical Skills Match', weight: 30 },
      { name: 'Years of Experience', weight: 25 },
      { name: 'Education Background', weight: 15 },
      { name: 'Project Relevance', weight: 20 },
      { name: 'Communication Skills', weight: 10 },
    ];
    
    const jobDescription = criteriaDoc?.jobDescription || job.description || job.title;
    
    // Extract candidate info from resume
    console.log('Extracting candidate info from resume...');
    let candidateInfo;
    try {
      candidateInfo = await extractCandidateInfo(resumeText);
      console.log('Extracted info:', candidateInfo);
    } catch (error: any) {
      console.error('Error extracting candidate info:', error);
      // Use fallback values if extraction fails
      candidateInfo = {
        name: 'Candidate ' + Date.now(),
        email: 'candidate' + Date.now() + '@example.com',
      };
    }
    
    // Check if candidate already exists
    const existingCandidate = await Candidate.findOne({ 
      email: candidateInfo.email,
      jobId 
    });
    
    if (existingCandidate) {
      console.log('Candidate already exists:', candidateInfo.email);
      return NextResponse.json(
        { success: false, error: `Candidate ${candidateInfo.name} already exists for this job` },
        { status: 400 }
      );
    }
    
    // Analyze resume with Gemini AI
    console.log('Analyzing resume with Gemini AI...');
    console.log('Job description:', jobDescription);
    console.log('Criteria:', jobCriteria);
    
    let analysis;
    try {
      analysis = await analyzeResume(
        resumeText,
        jobDescription,
        jobCriteria
      );
      console.log('Analysis complete:', analysis);
    } catch (error: any) {
      console.error('Gemini AI error:', error.message);
      throw new Error(`AI analysis failed: ${error.message}`);
    }
    
    // Map criteria scores to our schema
    const scores: any = {
      technicalSkills: 0,
      experience: 0,
      education: 0,
      projectRelevance: 0,
      communication: 0,
    };
    
    // Map dynamic criteria to fixed schema
    jobCriteria.forEach((criterion: { name: string; weight: number }) => {
      const name = criterion.name.toLowerCase();
    
      if (name.includes('technical') || name.includes('skill')) {
        scores.technicalSkills = analysis.scores.technicalSkills || 0;
      } else if (name.includes('experience') || name.includes('year')) {
        scores.experience = analysis.scores.experience || 0;
      } else if (name.includes('education')) {
        scores.education = analysis.scores.education || 0;
      } else if (name.includes('project') || name.includes('relevance')) {
        scores.projectRelevance = analysis.scores.projectRelevance || 0;
      } else if (name.includes('communication')) {
        scores.communication = analysis.scores.communication || 0;
      }
    });
    
    // Create candidate with AI analysis
    const candidate = await Candidate.create({
      name: candidateInfo.name,
      email: candidateInfo.email,
      phone: candidateInfo.phone,
      jobId,
      score: analysis.score,
      scores,
      summary: analysis.summary,
      highlights: analysis.highlights,
    });
    
    // Update job candidate count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { candidateCount: 1 },
    });
    
    return NextResponse.json({
      success: true,
      data: {
        ...candidate.toObject(),
        id: candidate._id,
      },
    });
  } catch (error: any) {
    console.error('Error analyzing resume:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to analyze resume' },
      { status: 500 }
    );
  }
}

