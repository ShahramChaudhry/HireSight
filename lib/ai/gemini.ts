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

  // 🧠 Format criteria list for both readability and AI consistency
  const criteriaList = criteria
    .map(c => `- ${c.name} (${c.weight}%)`)
    .join("\n");

  const criteriaJSONExample = criteria
    .map(c => `    "${c.name}": 0`)
    .join(",\n");

  // 💬 Dynamic & tolerant prompt
  const prompt = `You are an expert recruiter and AI evaluator. Analyze the following resume against the job description and the provided scoring criteria.

JOB DESCRIPTION:
${jobDescription}

SCORING CRITERIA:
${criteriaList}

RESUME TEXT:
${resumeText}

Provide a structured evaluation that includes:
1. An overall score from 0–10 (decimals allowed, e.g. 8.4)
2. A "scores" object with one numeric score (0–10) per criterion, using the exact same names as in the list above.
   - If a criterion does not apply or lacks sufficient info, estimate it based on related context rather than leaving it at 0.
   - Always include all criteria keys.
3. A concise summary (2–3 sentences)
4. Exactly 5 key highlights or strengths (bullet points)

⚠️ IMPORTANT:
- Respond ONLY with valid JSON (no markdown, no commentary)
- Use this exact format:

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

    // 🧹 Clean Gemini's response formatting
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const analysis = JSON.parse(text);

    // ✅ Validate essential structure
    if (
      typeof analysis.score !== "number" ||
      typeof analysis.scores !== "object" ||
      typeof analysis.summary !== "string" ||
      !Array.isArray(analysis.highlights)
    ) {
      throw new Error("Invalid Gemini response format");
    }

    // 🛠 Normalize missing/misaligned criteria keys
    criteria.forEach(c => {
      const key = c.name;
      if (typeof analysis.scores[key] !== "number") {
        analysis.scores[key] = 5; // neutral fallback if missing or invalid
      }
    });

    // 🧮 Normalize score range to 0–10 (prevent weird outputs)
    Object.keys(analysis.scores).forEach(k => {
      const val = analysis.scores[k];
      analysis.scores[k] = Math.min(10, Math.max(0, Number(val) || 0));
    });

    // ✅ Return final sanitized analysis
    return analysis;
  } catch (error: any) {
    console.error("Error analyzing resume with Gemini:", error);
    if (error.message?.includes("API key")) {
      throw new Error(
        "Invalid Gemini API key. Please check your GEMINI_API_KEY in .env.local"
      );
    }
    if (error.message?.includes("quota") || error.message?.includes("rate limit")) {
      throw new Error("Gemini API rate limit exceeded. Please try again later.");
    }
    throw new Error(
      `Gemini AI error: ${error.message || "Failed to analyze resume"}`
    );
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