import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Candidate from '@/lib/models/Candidate';
import Job from '@/lib/models/Job';

// GET candidates (with optional jobId filter)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('jobId');
    
    const query = jobId ? { jobId } : {};
    const candidates = await Candidate.find(query).sort({ score: -1 });
    
    return NextResponse.json({ success: true, data: candidates });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST create new candidate
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    const candidate = await Candidate.create(body);
    
    // Update job candidate count
    await Job.findByIdAndUpdate(body.jobId, {
      $inc: { candidateCount: 1 },
    });
    
    return NextResponse.json({ success: true, data: candidate }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

