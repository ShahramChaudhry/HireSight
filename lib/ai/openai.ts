import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
  const prompt = `You are an expert technical recruiter. Analyze the following resume against the job description and scoring criteria.

JOB DESCRIPTION:
${jobDescription}

SCORING CRITERIA:
${criteria.map(c => `- ${c.name}: ${c.weight}%`).join('\n')}

RESUME:
${resumeText}

Provide a detailed evaluation with:
1. Overall score (0-10)
2. Individual scores for each criterion (0-10)
3. A brief summary (2-3 sentences)
4. 5 key highlights or strengths

Respond ONLY with valid JSON in this exact format:
{
  "score": 8.5,
  "scores": {
    "technicalSkills": 9.0,
    "experience": 8.5,
    "education": 8.0,
    "projectRelevance": 9.0,
    "communication": 8.0
  },
  "summary": "Strong candidate with excellent technical skills...",
  "highlights": [
    "7+ years of React experience",
    "Led team of 5 developers",
    "Master's degree in Computer Science",
    "Open source contributor",
    "Experience with Next.js and TypeScript"
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview', // or 'gpt-3.5-turbo' for cheaper option
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical recruiter who evaluates candidates objectively and provides structured JSON responses.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent scoring
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const analysis = JSON.parse(content);
    return analysis;
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw new Error('Failed to analyze resume');
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
  const prompt = `You are an expert recruiter. Analyze this LinkedIn profile against the job description.

JOB DESCRIPTION:
${jobDescription}

LINKEDIN PROFILE:
${profileData}

Evaluate the candidate on:
1. Skills & Endorsements Match (0-10)
2. Experience & Career Progression (0-10)
3. Education & Certifications (0-10)
4. Recommendations & Activity (0-10)

Respond ONLY with valid JSON in this format:
{
  "score": 8.4,
  "scores": {
    "skillsMatch": 8.5,
    "experience": 9.0,
    "education": 8.0,
    "recommendations": 7.5
  },
  "summary": "Well-rounded LinkedIn profile with strong skill endorsements..."
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert recruiter who evaluates LinkedIn profiles objectively.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const analysis = JSON.parse(content);
    return analysis;
  } catch (error) {
    console.error('Error analyzing LinkedIn profile:', error);
    throw new Error('Failed to analyze LinkedIn profile');
  }
}

export async function extractResumeText(fileContent: string): Promise<string> {
  // This is a simplified version - in production, use a proper PDF parser
  // like pdf-parse or pdfjs-dist for PDF files
  // and mammoth for DOCX files
  return fileContent;
}

