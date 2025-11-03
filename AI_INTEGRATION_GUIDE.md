# AI Integration Guide - Resume & LinkedIn Analysis

## 🎯 Overview

This guide shows you how to integrate AI (OpenAI GPT-4) to automatically evaluate resumes and LinkedIn profiles.

---

## 📦 Step 1: Install Dependencies

```bash
cd /Users/shahram/Documents/greenstone
npm install openai pdf-parse mammoth
```

**What each does:**
- `openai` - OpenAI API client for GPT-4
- `pdf-parse` - Extract text from PDF resumes
- `mammoth` - Extract text from DOCX resumes

---

## 🔑 Step 2: Get OpenAI API Key

### Option A: OpenAI (Recommended)

1. **Sign up for OpenAI**
   - Go to https://platform.openai.com/signup
   - Create an account

2. **Add Payment Method**
   - Go to https://platform.openai.com/account/billing
   - Add a credit card (required for API access)
   - Set usage limits (e.g., $10/month) to control costs

3. **Create API Key**
   - Go to https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Name it "HireSight"
   - Copy the key (starts with `sk-...`)
   - **IMPORTANT:** Save it - you can't see it again!

4. **Add to .env.local**
   ```bash
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
   ```

### Option B: Anthropic Claude (Alternative)

1. Go to https://console.anthropic.com/
2. Sign up and get API key
3. Add to `.env.local`:
   ```bash
   ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
   ```

---

## 💰 Cost Estimates

### OpenAI GPT-4 Pricing

**Per Resume Analysis:**
- Input: ~2,000 tokens (resume + job description)
- Output: ~500 tokens (analysis)
- Cost: **$0.05 - $0.15 per resume**

**Per LinkedIn Profile:**
- Input: ~1,500 tokens
- Output: ~300 tokens
- Cost: **$0.03 - $0.08 per profile**

**Monthly Estimate (100 candidates):**
- 100 resumes analyzed: ~$10
- 50 LinkedIn profiles: ~$4
- **Total: ~$14/month**

### GPT-3.5 Turbo (Budget Option)
- **90% cheaper** than GPT-4
- Still very good quality
- **~$1.50/month** for 100 candidates

---

## 🔧 Step 3: Update Environment Variables

Edit your `.env.local`:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://...

# OpenAI API
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx

# Optional: Choose model (gpt-4-turbo-preview or gpt-3.5-turbo)
OPENAI_MODEL=gpt-4-turbo-preview

# Application
NEXT_PUBLIC_APP_NAME=HireSight
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

---

## 📝 Step 4: Update API Routes

### Resume Upload & Analysis

Create `/app/api/analyze-resume/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { analyzeResume } from '@/lib/ai/openai';
import connectDB from '@/lib/mongodb';
import Candidate from '@/lib/models/Candidate';
import Job from '@/lib/models/Job';

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobId, candidateName, candidateEmail } = await request.json();
    
    await connectDB();
    
    // Get job details for analysis
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Analyze with AI
    const analysis = await analyzeResume(
      resumeText,
      job.description || '',
      [
        { name: 'Technical Skills', weight: 30 },
        { name: 'Experience', weight: 25 },
        { name: 'Education', weight: 15 },
        { name: 'Project Relevance', weight: 20 },
        { name: 'Communication', weight: 10 },
      ]
    );
    
    // Create candidate with AI analysis
    const candidate = await Candidate.create({
      name: candidateName,
      email: candidateEmail,
      jobId,
      score: analysis.score,
      scores: analysis.scores,
      summary: analysis.summary,
      highlights: analysis.highlights,
    });
    
    // Update job candidate count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { candidateCount: 1 },
    });
    
    return NextResponse.json({
      success: true,
      data: candidate,
    });
  } catch (error: any) {
    console.error('Error analyzing resume:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### LinkedIn Profile Analysis

Create `/app/api/analyze-linkedin/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { analyzeLinkedInProfile } from '@/lib/ai/openai';

export async function POST(request: NextRequest) {
  try {
    const { profileUrl, jobDescription } = await request.json();
    
    // In production, you'd use LinkedIn API or scraping here
    // For now, we'll use the URL as placeholder
    const profileData = `LinkedIn Profile: ${profileUrl}
    [In production, fetch actual profile data via LinkedIn API]`;
    
    const analysis = await analyzeLinkedInProfile(
      profileData,
      jobDescription
    );
    
    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    console.error('Error analyzing LinkedIn:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

---

## 🚀 Step 5: Update Frontend

### Upload Page Integration

Update the `handleProcess` function in `/app/upload/page.tsx`:

```typescript
const handleProcess = async () => {
  setIsProcessing(true);
  setShowSuccess(false);
  
  try {
    // Process each file
    for (const file of uploadedFiles) {
      // Extract text from file (simplified - in production use pdf-parse/mammoth)
      const resumeText = `Resume content from ${file.name}`;
      
      // Analyze with AI
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobId: 'your-job-id-here', // Get from URL params or context
          candidateName: 'Extracted from resume',
          candidateEmail: 'extracted@email.com',
        }),
      });
      
      const data = await response.json();
      if (!data.success) {
        console.error('Failed to analyze:', file.name);
      }
    }
    
    setIsProcessing(false);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  } catch (error) {
    console.error('Error processing files:', error);
    setIsProcessing(false);
    alert('Failed to process files. Please try again.');
  }
};
```

---

## 🔍 How It Works

### Resume Analysis Flow

```
1. User uploads PDF/DOCX → Extract text
2. Send to OpenAI GPT-4 → With job description + criteria
3. AI analyzes → Returns scores and summary
4. Save to MongoDB → Candidate with scores
5. Display in Rankings → Sorted by score
```

### Prompt Engineering

The AI prompt includes:
- ✅ Job description
- ✅ Scoring criteria with weights
- ✅ Resume text
- ✅ Clear instructions for JSON output
- ✅ Examples of expected format

### Scoring Logic

AI evaluates:
1. **Technical Skills Match** - Technologies, tools, frameworks
2. **Years of Experience** - Total experience, relevant experience
3. **Education Background** - Degrees, certifications, institutions
4. **Project Relevance** - Similar projects, domain knowledge
5. **Communication Skills** - Writing quality, clarity, presentation

---

## ⚡ Alternative AI Services

### 1. Anthropic Claude
```bash
npm install @anthropic-ai/sdk
```

Pros:
- Longer context window
- Often more detailed analysis
- Good at following instructions

### 2. Google Gemini
```bash
npm install @google/generative-ai
```

Pros:
- Free tier available
- Multimodal (can read resume images)
- Good performance

### 3. Specialized Services

**Resume Parsing:**
- Affinda (https://affinda.com)
- Sovren (https://sovren.com)
- HireAbility (https://www.hireability.com)

**LinkedIn Scraping:**
- PhantomBuster (https://phantombuster.com)
- ScrapingBee (https://scrapingbee.com)
- Proxycurl (https://nubela.co/proxycurl)

---

## 🛡️ Best Practices

### 1. Rate Limiting
```typescript
// Add rate limiting to prevent abuse
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
});
```

### 2. Caching
```typescript
// Cache AI responses to save costs
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

// Check cache first
const cached = await redis.get(`resume:${hash}`);
if (cached) return cached;

// If not cached, analyze and cache
const analysis = await analyzeResume(...);
await redis.set(`resume:${hash}`, analysis, { ex: 86400 }); // 24h
```

### 3. Error Handling
```typescript
try {
  const analysis = await analyzeResume(...);
} catch (error) {
  // Fallback to manual review
  return {
    score: 0,
    needsManualReview: true,
    error: error.message,
  };
}
```

### 4. Cost Management
- Set OpenAI usage limits
- Use GPT-3.5 for initial screening
- Use GPT-4 for final evaluation
- Cache results aggressively
- Batch process when possible

---

## 📊 Testing

### Test with Sample Resume

```bash
curl -X POST http://localhost:3001/api/analyze-resume \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "John Doe\nSenior Frontend Developer\n5 years React experience...",
    "jobId": "your-job-id",
    "candidateName": "John Doe",
    "candidateEmail": "john@example.com"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "score": 8.5,
    "scores": {
      "technicalSkills": 9.0,
      "experience": 8.5,
      "education": 8.0,
      "projectRelevance": 9.0,
      "communication": 8.0
    },
    "summary": "Strong candidate...",
    "highlights": [...]
  }
}
```

---

## 🎯 Next Steps

1. ✅ Get OpenAI API key
2. ✅ Add to `.env.local`
3. ✅ Install packages
4. ✅ Test with sample data
5. ✅ Integrate with upload flow
6. ✅ Deploy to production

---

## 💡 Pro Tips

1. **Start with GPT-3.5** - Test everything, then upgrade to GPT-4
2. **Use streaming** - Show real-time analysis progress
3. **Batch processing** - Process multiple resumes in parallel
4. **A/B testing** - Compare AI scores with human reviewers
5. **Feedback loop** - Let users correct AI scores to improve prompts

---

## 🆘 Troubleshooting

### Error: "Insufficient quota"
→ Add payment method in OpenAI dashboard

### Error: "Rate limit exceeded"
→ Implement rate limiting and caching

### Poor quality scores
→ Improve prompt with more examples and context

### High costs
→ Switch to GPT-3.5 or implement caching

---

## 📚 Resources

- OpenAI Documentation: https://platform.openai.com/docs
- OpenAI Cookbook: https://github.com/openai/openai-cookbook
- Prompt Engineering Guide: https://promptingguide.ai
- Cost Calculator: https://openai.com/pricing

---

**Ready to implement?** Start with OpenAI GPT-3.5 for testing, then upgrade to GPT-4 for production! 🚀

