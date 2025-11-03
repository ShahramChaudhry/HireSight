import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface ResumeAnalysis {
  score: number;
  scores: {
    technicalSkills: number;
    experience: number;
    education: number;
    projectRelevance: number;
    communication: number;
  };
  summary: string;
  highlights: string[];
}

export async function analyzeResume(
  resumeText: string,
  jobDescription: string,
  criteria: { name: string; weight: number }[]
): Promise<ResumeAnalysis> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  // 🧠 Dynamically format criteria into readable + machine-parseable form
  const criteriaList = criteria
    .map(c => `- ${c.name} (${c.weight}%)`)
    .join('\n');

  const criteriaJSONExample = criteria
    .map(c => `    "${c.name}": 0`)
    .join(',\n');

  // 💬 New dynamic prompt
  const prompt = `You are an expert recruiter and AI evaluator. Analyze the following resume against the provided job description and scoring criteria.

JOB DESCRIPTION:
${jobDescription}

SCORING CRITERIA:
${criteriaList}

RESUME:
${resumeText}

Provide a structured evaluation that includes:
1. An overall score from 0–10 (use decimals like 8.5)
2. A "scores" object with one numeric score (0–10) per criterion name above
3. A short summary (2–3 sentences)
4. Exactly 5 key highlights or strengths (bullet points)

IMPORTANT: 
Respond ONLY with valid JSON (no markdown, no code blocks) in this EXACT format:
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

    console.log('Gemini raw response:', text);

    // Clean up
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis = JSON.parse(text);

    // Validate essential structure
    if (
      typeof analysis.score !== 'number' ||
      typeof analysis.scores !== 'object' ||
      typeof analysis.summary !== 'string' ||
      !Array.isArray(analysis.highlights)
    ) {
      throw new Error('Invalid Gemini response format');
    }

    return analysis;
  } catch (error: any) {
    console.error('Error analyzing resume with Gemini:', error);
    if (error.message?.includes('API key')) {
      throw new Error('Invalid Gemini API key. Please check your GEMINI_API_KEY in .env.local');
    }
    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      throw new Error('Gemini API rate limit exceeded. Please try again later.');
    }
    throw new Error(`Gemini AI error: ${error.message || 'Failed to analyze resume'}`);
  }
}
export interface LinkedInAnalysis {
  score: number;
  scores: {
    skillsMatch: number;
    experience: number;
    education: number;
    recommendations: number;
  };
  summary: string;
}

export async function analyzeLinkedInProfile(
  profileData: string,
  jobDescription: string
): Promise<LinkedInAnalysis> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `You are an expert recruiter. Analyze this LinkedIn profile against the job description.

JOB DESCRIPTION:
${jobDescription}

LINKEDIN PROFILE DATA:
${profileData}

Evaluate the candidate on these criteria (each 0-10):
1. Skills & Endorsements Match - How well their skills match the job requirements
2. Experience & Career Progression - Years of experience and career growth
3. Education & Certifications - Educational background and relevant certifications
4. Recommendations & Activity - Professional recommendations and LinkedIn activity

Calculate an overall score based on these four scores.

IMPORTANT: Respond ONLY with valid JSON in this EXACT format (no markdown, no code blocks):
{
  "score": 8.4,
  "scores": {
    "skillsMatch": 8.5,
    "experience": 9.0,
    "education": 8.0,
    "recommendations": 7.5
  },
  "summary": "Well-rounded LinkedIn profile with 6 years of software engineering experience. Strong skill endorsements in React (85), JavaScript (120), and TypeScript (45). Career progression shows growth from Junior to Senior Engineer. Bachelor's in Computer Science plus AWS certification. Has 8 recommendations and regular activity."
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up response
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const analysis = JSON.parse(text);
    
    // Validate response
    if (!analysis.score || !analysis.scores || !analysis.summary) {
      throw new Error('Invalid response format from Gemini');
    }
    
    return analysis;
  } catch (error) {
    console.error('Error analyzing LinkedIn profile with Gemini:', error);
    throw new Error('Failed to analyze LinkedIn profile');
  }
}

// Helper function to extract candidate info from resume text
export async function extractCandidateInfo(resumeText: string): Promise<{
  name: string;
  email: string;
  phone?: string;
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `Extract the candidate's contact information from this resume.

RESUME:
${resumeText}

Respond ONLY with valid JSON in this format (no markdown):
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "+1 234-567-8900"
}

If any field is not found, use empty string.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    console.log('Gemini extract info response:', text);
    
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const info = JSON.parse(text);
    return {
      name: info.name || 'Unknown Candidate',
      email: info.email || `candidate_${Date.now()}@example.com`,
      phone: info.phone || undefined,
    };
  } catch (error: any) {
    console.error('Error extracting candidate info:', error);
    console.error('Error message:', error.message);
    
    // Return fallback values instead of throwing
    return {
      name: 'Unknown Candidate',
      email: `candidate_${Date.now()}@example.com`,
    };
  }
}

