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

  const criteriaList = criteria.map((c) => `- ${c.name} (${c.weight}%)`).join("\n");
  const criteriaJSONExample = criteria.map((c) => `    "${c.name}": 0`).join(",\n");

  const prompt = `You are an expert recruiter and hiring evaluator.
Your task is to **analyze a candidate's resume** against a provided job description and criteria, 
then produce a structured evaluation with a numeric score for each category.

Focus on **reasoning first**, then return valid JSON at the end.

JOB DESCRIPTION:
${jobDescription}

SCORING CRITERIA (importance weights):
${criteriaList}

RESUME TEXT:
${resumeText}

---
### Evaluation Instructions
1. Think step-by-step about how well the candidate meets each criterion.
2. Use evidence and implied skills — not just keyword matches.
   • Example: “Google Ads” or “Canva” imply Marketing Tools proficiency.  
   • “Team leadership” or “client presentations” imply Communication & Teamwork.
3. Use these score ranges:
   • Excellent / directly proven → 8–10  
   • Partial / implied → 5–7  
   • Weak / limited mention → 2–4  
   • Not present at all → 0–1
4. Always assign **a numeric score (0–10)** for every criterion listed.
5. Avoid giving all 10s; balance scores realistically.

Finally, return **only valid JSON** in this exact format:

{
  "score": 8.5,
  "scores": {
${criteriaJSONExample}
  },
  "summary": "2–3 sentence summary of the candidate’s overall fit.",
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
    console.log("🧠 Gemini raw response:", text);

    // Clean up markdown fences
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    // 🧩 Try to extract the first valid JSON object
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Gemini did not return valid JSON in response");
    }

    const jsonString = jsonMatch[0]; // Only take the JSON part
    let analysis;
    try {
      analysis = JSON.parse(jsonString);
    } catch (err) {
      console.error("❌ Failed to parse Gemini JSON:", jsonString);
      throw new Error("Gemini returned malformed JSON");
    }

    if (
      typeof analysis.score !== "number" ||
      typeof analysis.scores !== "object" ||
      typeof analysis.summary !== "string" ||
      !Array.isArray(analysis.highlights)
    ) {
      throw new Error("Invalid Gemini response format");
    }

    const parsedScores: Record<string, number> = {};
    for (const key in analysis.scores) {
      const cleanKey = key.trim(); // 🧹 remove any leading/trailing spaces
      const val = parseFloat(analysis.scores[key]);
      parsedScores[cleanKey] = isNaN(val) ? 0 : val;
    }

    // Log the parsed scores for debugging
    console.log("✅ Parsed Gemini scores:", parsedScores);

    return {
      score: parseFloat(analysis.score) || 0,
      scores: parsedScores,
      summary: analysis.summary.trim(),
      highlights: analysis.highlights.slice(0, 5),
    };
  } catch (error: any) {
    console.error("❌ Error analyzing resume with Gemini:", error);
    throw new Error(`Gemini AI error: ${error.message || "Failed to analyze resume"}`);
  }
}
// ... (extractCandidateInfo function remains the same)
export async function extractCandidateInfo(resumeText: string): Promise<{
  name: string;
  email: string;
  phone?: string;
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const prompt = `Extract the candidate's contact information from this resume.

RESUME:
${resumeText}

Respond ONLY with valid JSON:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "+1 234-567-8900"
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const info = JSON.parse(text);
    return {
      name: info.name || "Unknown Candidate",
      email: info.email || `candidate_${Date.now()}@example.com`,
      phone: info.phone || undefined,
    };
  } catch (error) {
    console.error("Error extracting candidate info:", error);
    return {
      name: "Unknown Candidate",
      email: `candidate_${Date.now()}@example.com`,
    };
  }
}