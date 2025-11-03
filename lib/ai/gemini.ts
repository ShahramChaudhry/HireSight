import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface ResumeAnalysis {
  score: number;
  scores: Record<string, number>;
  summary: string;
  highlights: string[];
}

export async function analyzeResume(
  resumeText: string,
  jobDescription: string,
  criteria: { name: string; weight: number }[]
): Promise<ResumeAnalysis> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Format criteria for consistency
  const criteriaList = criteria.map(c => `- ${c.name} (${c.weight}%)`).join("\n");
  const criteriaJSONExample = criteria.map(c => `    "${c.name}": 0`).join(",\n");

  // 🧠 Context-aware, job-agnostic reasoning prompt
  const prompt = `You are an expert recruiter and AI evaluator.
  Analyze the following resume against the provided job description and scoring criteria.
  
  Your goal is to reason contextually — evaluate each criterion based on evidence and relevance to the job's domain.
  
  JOB DESCRIPTION:
  ${jobDescription}
  
  SCORING CRITERIA:
  ${criteriaList}
  
  RESUME TEXT:
  ${resumeText}
  
  Follow these reasoning rules:
  - Always ground your analysis in the job description context.
  - For **Education** or similar criteria:
    • Evaluate how relevant the candidate's degree, major, or field of study is to the job role or industry.
    • If the degree directly matches (e.g., "Computer Science" for a Software Engineer, "Marketing" for a Marketing role), score high (8–10).
    • If somewhat related (e.g., "Business Administration" for a Marketing job), score moderate (5–7).
    • If unrelated or unclear, score low (2–4).
    • Do not give a neutral 5 unless there is absolutely no information.
  - For **Skills / Tools** criteria, match both exact tools and synonyms or equivalents (e.g., "Photoshop" counts for "Design Tools").
  - For **Experience** criteria, consider both duration and relevance to the job duties.
  - For **Soft Skills** (communication, teamwork, creativity), look for indirect evidence like group projects, presentations, or leadership roles.
  - When information is missing, infer from context — job titles, achievements, or domain hints.
  - Every criterion must be scored (0–10); never omit keys or leave them all equal.
  
  Return valid JSON in the following exact structure (no markdown, no commentary):
  
  {
    "score": 8.5,
    "scores": {
  ${criteriaJSONExample}
    },
    "summary": "Concise explanation of performance relative to criteria.",
    "highlights": [
      "Specific quantified strength 1",
      "Specific quantified strength 2",
      "Specific quantified strength 3",
      "Specific quantified strength 4",
      "Specific quantified strength 5"
    ]
  }`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    console.log("Gemini raw response:", text);

    // Clean Gemini's response
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const analysis = JSON.parse(text);

    // Validate and normalize
    if (
      typeof analysis.score !== "number" ||
      typeof analysis.scores !== "object" ||
      typeof analysis.summary !== "string" ||
      !Array.isArray(analysis.highlights)
    ) {
      throw new Error("Invalid Gemini response format");
    }

    // Fill missing criteria safely
    criteria.forEach(c => {
      if (typeof analysis.scores[c.name] !== "number") {
        analysis.scores[c.name] = 5;
      }
    });

    // Clamp values 0–10
    Object.keys(analysis.scores).forEach(k => {
      const val = Number(analysis.scores[k]);
      analysis.scores[k] = Math.min(10, Math.max(0, val || 0));
    });

    return analysis;
  } catch (error: any) {
    console.error("Error analyzing resume with Gemini:", error);
    if (error.message?.includes("API key")) {
      throw new Error("Invalid Gemini API key. Check GEMINI_API_KEY in .env.local");
    }
    if (error.message?.includes("quota") || error.message?.includes("rate limit")) {
      throw new Error("Gemini API rate limit exceeded. Please try again later.");
    }
    throw new Error(`Gemini AI error: ${error.message || "Failed to analyze resume"}`);
  }
}

// ✅ Helper function to extract candidate info from resume text
export async function extractCandidateInfo(resumeText: string): Promise<{
  name: string;
  email: string;
  phone?: string;
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `Extract the candidate's contact information from this resume.

RESUME:
${resumeText}

Respond ONLY with valid JSON in this format (no markdown):
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "+1 234-567-8900"
}

If any field is not found, use an empty string.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    console.log("Gemini extract info response:", text);

    // Clean up Gemini's response formatting
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const info = JSON.parse(text);
    return {
      name: info.name || "Unknown Candidate",
      email: info.email || `candidate_${Date.now()}@example.com`,
      phone: info.phone || undefined,
    };
  } catch (error: any) {
    console.error("Error extracting candidate info:", error);
    // Fallback to safe defaults
    return {
      name: "Unknown Candidate",
      email: `candidate_${Date.now()}@example.com`,
    };
  }
}