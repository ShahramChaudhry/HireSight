import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Candidate from '@/lib/models/Candidate';
import Job from '@/lib/models/Job'; // ✅ added to update candidateCount

// GET single candidate
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const candidate = await Candidate.findById(params.id);
    
    if (!candidate) {
      return NextResponse.json(
        { success: false, error: 'Candidate not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: candidate });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT update candidate
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    
    const candidate = await Candidate.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!candidate) {
      return NextResponse.json(
        { success: false, error: 'Candidate not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: candidate });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// DELETE candidate (with Job candidateCount update)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Step 1: Find candidate to get jobId
    const candidate = await Candidate.findById(params.id);
    if (!candidate) {
      return NextResponse.json(
        { success: false, error: 'Candidate not found' },
        { status: 404 }
      );
    }

    const jobId = candidate.jobId;

    // Step 2: Delete candidate
    await Candidate.findByIdAndDelete(params.id);

    // Step 3: Count remaining candidates for that job
    const remainingCount = await Candidate.countDocuments({ jobId });

    // Step 4: Update the related Job’s candidateCount
    await Job.findByIdAndUpdate(jobId, { candidateCount: remainingCount });

    return NextResponse.json({
      success: true,
      data: {},
      message: 'Candidate deleted and job candidate count updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}