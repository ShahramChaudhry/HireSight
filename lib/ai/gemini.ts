import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface ResumeAnalysis {
  score: number;
  scores: Record<string, number>; // ✅ dynamic keys instead of fixed schema
  summary: string;
  highlights: string[];
}

export async function analyzeResume(
  resumeText: string,
  jobDescription: string,
  criteria: { name: string; weight: number }[]
): Promise<ResumeAnalysis> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // 🧠 Build human- and machine-readable criteria list
  const criteriaList = criteria.map((c) => `- ${c.name} (${c.weight}%)`).join("\n");

  const criteriaJSONExample = criteria.map((c) => `    "${c.name}": 0`).join(",\n");

  // 💬 Dynamic prompt to force model to use job's exact criteria names
  const prompt = `You are an expert recruiter and AI evaluator. Analyze the following resume against the provided job description and scoring criteria.

JOB DESCRIPTION:
${jobDescription}

SCORING CRITERIA:
${criteriaList}

RESUME:
${resumeText}

Provide a structured evaluation that includes:
1. An overall score from 0–10 (decimals allowed)
2. A "scores" object with numeric scores (0–10) for **each criterion name above** exactly as written
3. A concise 2–3 sentence summary
4. Exactly 5 bullet-point highlights of key strengths

⚠️ IMPORTANT:
Respond ONLY with valid JSON (no markdown, no code blocks) in this exact shape:
{
  "score": 8.5,
  "scores": {
${criteriaJSONExample}
  },
  "summary": "Brief explanation of the candidate’s strengths and weaknesses.",
  "highlights": [
    "Strength 1",
    "Strength 2",
    "Strength 3",
    "Strength 4",
    "Strength 5"
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    console.log("Gemini raw response:", text);

    // 🧹 Clean up potential formatting artifacts
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    // 🧩 Parse and validate
    const analysis = JSON.parse(text);

    if (
      typeof analysis.score !== "number" ||
      typeof analysis.scores !== "object" ||
      typeof analysis.summary !== "string" ||
      !Array.isArray(analysis.highlights)
    ) {
      throw new Error("Invalid Gemini response format");
    }

    // 🧠 Normalize all numeric values
    const parsedScores: Record<string, number> = {};
    for (const key in analysis.scores) {
      parsedScores[key] = parseFloat(analysis.scores[key]) || 0;
    }

    return {
      score: parseFloat(analysis.score) || 0,
      scores: parsedScores,
      summary: analysis.summary.trim(),
      highlights: analysis.highlights.slice(0, 5),
    };
  } catch (error: any) {
    console.error("Error analyzing resume with Gemini:", error);

    if (error.message?.includes("API key")) {
      throw new Error("Invalid Gemini API key. Please check your GEMINI_API_KEY in .env.local");
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