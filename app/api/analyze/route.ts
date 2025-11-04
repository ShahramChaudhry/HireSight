export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { analyzeResume, extractCandidateInfo } from "@/lib/ai/gemini";
import connectDB from "@/lib/mongodb";
import Candidate from "@/lib/models/Candidate";
import Job from "@/lib/models/Job";
import Criteria from "@/lib/models/Criteria";

export async function POST(request: NextRequest) {
  console.log("✅ /api/analyze route loaded");
  try {
    const { resumeText, jobId } = await request.json();

    if (!resumeText || !jobId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY not set in environment variables");
      return NextResponse.json(
        {
          success: false,
          error:
            "AI service not configured. Please add GEMINI_API_KEY to .env.local",
        },
        { status: 500 }
      );
    }

    await connectDB();

    // 🧩 Fetch job info + dynamic criteria
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    const criteriaDoc = await Criteria.findOne({ jobId });
    const jobCriteria =
      criteriaDoc?.criteria || [
        { name: "Technical Skills Match", weight: 30 },
        { name: "Years of Experience", weight: 25 },
        { name: "Education Background", weight: 15 },
        { name: "Project Relevance", weight: 20 },
        { name: "Communication Skills", weight: 10 },
      ];

    const jobDescription =
      criteriaDoc?.jobDescription || job.description || job.title;

    // 🧠 Extract candidate info from resume
    let candidateInfo;
    try {
      candidateInfo = await extractCandidateInfo(resumeText);
      console.log("Extracted candidate info:", candidateInfo);
    } catch (error: any) {
      console.error("Error extracting candidate info:", error);
      candidateInfo = {
        name: "Candidate " + Date.now(),
        email: "candidate" + Date.now() + "@example.com",
      };
    }

    // 🔍 Check if candidate already exists for this job
    const existingCandidate = await Candidate.findOne({
      email: candidateInfo.email,
      jobId,
    });
    if (existingCandidate) {
      console.log("Candidate already exists:", candidateInfo.email);
      return NextResponse.json(
        {
          success: false,
          error: `Candidate ${candidateInfo.name} already exists for this job`,
        },
        { status: 400 }
      );
    }

    // 💬 Run resume analysis with Gemini AI
    console.log("Analyzing resume with Gemini AI...");
    let analysis;
    try {
      analysis = await analyzeResume(resumeText, jobDescription, jobCriteria);
      console.log("✅ Analysis complete:", analysis);
    } catch (error: any) {
      console.error("Gemini AI error:", error.message);
      throw new Error(`AI analysis failed: ${error.message}`);
    }

    // 🧩 Dynamically build scores from criteria names
    const scores: Record<string, number> = {};
    for (const criterion of jobCriteria) {
      const key = criterion.name.trim();
      // Try to map using exact name or fallback to normalized lowercase key
      scores[key] =
        analysis.scores?.[key] ??
        analysis.scores?.[key.toLowerCase()] ??
        0;
    }

    // 🧮 Compute weighted total score
    const totalScore =
    jobCriteria.reduce((sum: number, c: { name: string; weight: number }) => {
      const val = scores[c.name] || 0;
      return sum + val * (c.weight / 100);
    }, 0) || 0;

    // 📝 Create candidate record
    const candidate = await Candidate.create({
      name: candidateInfo.name,
      email: candidateInfo.email,
      phone: candidateInfo.phone,
      jobId,
      score: totalScore,
      scores,
      summary: analysis.summary,
      highlights: analysis.highlights || [],
    });

    // 🔄 Increment candidate count for job
    await Job.findByIdAndUpdate(jobId, { $inc: { candidateCount: 1 } });

    return NextResponse.json({
      success: true,
      data: {
        ...candidate.toObject(),
        id: candidate._id,
      },
    });
  } catch (error: any) {
    console.error("❌ Error analyzing resume:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to analyze resume" },
      { status: 500 }
    );
  }
}