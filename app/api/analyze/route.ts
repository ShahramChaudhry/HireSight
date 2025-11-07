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
    // 🧩 Build normalized score map and log mismatches
   // 🧠 Normalize Gemini's returned keys (trim spaces + lowercase)
  const normalizedGeminiScores: Record<string, number> = {};
  for (const key in analysis.scores) {
    const cleanKey = key.trim().toLowerCase();
    normalizedGeminiScores[cleanKey] = analysis.scores[key];
  }

  const scores: Record<string, number> = {};
  const availableKeys = Object.keys(normalizedGeminiScores);
  console.log("🧠 Gemini returned (normalized) criteria keys:", availableKeys);

  for (const criterion of jobCriteria) {
    const cleanName = criterion.name.trim().toLowerCase();
    const val = normalizedGeminiScores[cleanName] ?? 0;

    if (val === 0) {
      console.warn(`⚠️ No score found for "${criterion.name}" → available keys:`, availableKeys);
    }

    scores[criterion.name] = val;
  }

  console.log("✅ Final mapped scores:", scores);
    // 🧩 Log specific key values
    console.log("🔍 Education Background:", scores["Education Background"]);
    console.log("🔍 Marketing Tools & Digital Skills:", scores["Marketing Tools & Digital Skills"]);
    // 🧮 Compute weighted total score
    // 🧮 Compute weighted total with detailed logging
      const totalWeight =
      jobCriteria.reduce((sum: number, c: { weight: number }) => sum + (c.weight || 0), 0) || 100;

      console.log("📊 Starting totalScore calculation...");
      console.log("Job Criteria:", jobCriteria);
      console.log("Scores object:", scores);
      console.log("Total Weight:", totalWeight);

      let debugSum = 0;

      for (const c of jobCriteria) {
      const rawScore = scores[c.name];
      const weight = c.weight || 0;
      const contribution = (rawScore || 0) * (weight / totalWeight);
      console.log(
        `➡️ ${c.name}: score=${rawScore} × weight=${weight} / totalWeight=${totalWeight} = ${contribution.toFixed(2)}`
      );
      debugSum += contribution;
      }

      const totalScore = debugSum;

      console.log("✅ Weighted total (normalized to 0–10 scale):", totalScore.toFixed(2));

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