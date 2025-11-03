import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Criteria from '@/lib/models/Criteria';

// GET criteria for a job
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('jobId');
    
    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }
    
    await connectDB();
    const criteria = await Criteria.findOne({ jobId });
    
    return NextResponse.json({ success: true, data: criteria });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST/PUT create or update criteria for a job
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    const { jobId, jobDescription, criteria } = body;
    
    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }
    
    // Upsert (update if exists, create if not)
    const criteriaDoc = await Criteria.findOneAndUpdate(
      { jobId },
      { jobId, jobDescription, criteria },
      { new: true, upsert: true }
    );
    
    return NextResponse.json({ success: true, data: criteriaDoc });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

