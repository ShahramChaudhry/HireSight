# Google Gemini AI Setup Guide

## 🎯 Why Gemini?

- ✅ **FREE Tier** - 60 requests per minute (plenty for most apps!)
- ✅ **No Credit Card Required** - Start immediately
- ✅ **High Quality** - Comparable to GPT-4
- ✅ **Fast** - Quick response times
- ✅ **Multimodal** - Can process images (future feature)

---

## 🚀 Step-by-Step Setup (5 Minutes)

### Step 1: Get Gemini API Key

1. **Go to Google AI Studio**
   - Open: https://makersuite.google.com/app/apikey
   - Or: https://aistudio.google.com/app/apikey

2. **Sign In**
   - Use your Google account
   - No payment required!

3. **Create API Key**
   - Click **"Get API Key"** or **"Create API Key"**
   - Choose **"Create API key in new project"** (recommended)
   - Or select an existing Google Cloud project
   - Click **"Create API key"**

4. **Copy Your Key**
   - Copy the API key (starts with `AIza...`)
   - **Save it somewhere safe!**
   - You can always view it again later

---

### Step 2: Install Dependencies

```bash
cd /Users/shahram/Documents/greenstone
npm install @google/generative-ai
```

---

### Step 3: Add API Key to .env.local

Edit your `.env.local` file and add:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://...

# Google Gemini API
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Application
NEXT_PUBLIC_APP_NAME=HireSight
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

---

### Step 4: Create API Routes

#### Resume Analysis API

Create `/app/api/analyze-resume/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { analyzeResume, extractCandidateInfo } from '@/lib/ai/gemini';
import connectDB from '@/lib/mongodb';
import Candidate from '@/lib/models/Candidate';
import Job from '@/lib/models/Job';

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobId } = await request.json();
    
    if (!resumeText || !jobId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Get job details
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Extract candidate info from resume
    const candidateInfo = await extractCandidateInfo(resumeText);
    
    // Analyze resume with Gemini AI
    const analysis = await analyzeResume(
      resumeText,
      job.description || job.title,
      [
        { name: 'Technical Skills Match', weight: 30 },
        { name: 'Years of Experience', weight: 25 },
        { name: 'Education Background', weight: 15 },
        { name: 'Project Relevance', weight: 20 },
        { name: 'Communication Skills', weight: 10 },
      ]
    );
    
    // Create candidate with AI analysis
    const candidate = await Candidate.create({
      name: candidateInfo.name,
      email: candidateInfo.email,
      phone: candidateInfo.phone,
      jobId,
      score: analysis.score,
      scores: {
        technicalSkills: analysis.scores.technicalSkills,
        experience: analysis.scores.experience,
        education: analysis.scores.education,
        projectRelevance: analysis.scores.projectRelevance,
        communication: analysis.scores.communication,
      },
      summary: analysis.summary,
      highlights: analysis.highlights,
    });
    
    // Update job candidate count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { candidateCount: 1 },
    });
    
    return NextResponse.json({
      success: true,
      data: {
        ...candidate.toObject(),
        id: candidate._id,
      },
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

#### LinkedIn Analysis API

Create `/app/api/analyze-linkedin/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { analyzeLinkedInProfile } from '@/lib/ai/gemini';

export async function POST(request: NextRequest) {
  try {
    const { profileData, jobDescription } = await request.json();
    
    if (!profileData || !jobDescription) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
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

### Step 5: Update Upload Page

Update `/app/upload/page.tsx` to use the AI:

```typescript
const handleProcess = async () => {
  if (uploadedFiles.length === 0) {
    alert('Please upload at least one file');
    return;
  }
  
  // Get job ID from URL or context
  const jobId = '...' // You'll need to pass this from context or URL
  
  setIsProcessing(true);
  setShowSuccess(false);
  
  try {
    let successCount = 0;
    
    for (const file of uploadedFiles) {
      // In production, read actual file content
      // For now, simulate with file name
      const resumeText = `Resume from ${file.name}\n[File content would be extracted here]`;
      
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobId,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        successCount++;
      }
    }
    
    setIsProcessing(false);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      // Optionally redirect to rankings
      // window.location.href = '/rankings';
    }, 3000);
  } catch (error) {
    console.error('Error processing files:', error);
    setIsProcessing(false);
    alert('Failed to process files. Please try again.');
  }
};
```

---

## 🧪 Test Your Setup

### 1. Quick Test (Terminal)

```bash
# Test if API key works
curl -X POST http://localhost:3001/api/analyze-resume \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "John Doe\nSenior Frontend Developer\n\n5 years of experience with React, TypeScript, and Next.js. Built scalable web applications for Fortune 500 companies. Strong problem-solving skills and team leadership experience.\n\nEducation: BS Computer Science, Stanford University\n\nSkills: React, TypeScript, Next.js, Node.js, MongoDB, AWS",
    "jobId": "YOUR_JOB_ID_HERE"
  }'
```

### 2. Test via Frontend

1. Restart your server: `npm run dev`
2. Go to Upload page
3. Upload a text file with resume content
4. Click "Process & Evaluate CVs"
5. Check Rankings page for new candidate

---

## 💰 Gemini Pricing & Limits

### Free Tier (Gemini Pro)
- ✅ **60 requests per minute**
- ✅ **1,500 requests per day**
- ✅ **Completely FREE**
- ✅ No credit card required

### Paid Tier (If needed later)
- $0.00025 per 1K characters (input)
- $0.0005 per 1K characters (output)
- **~$0.01-0.02 per resume** (very cheap!)

**Cost Comparison:**
- Gemini Free: $0 (up to 1,500/day)
- Gemini Pro Paid: ~$0.01/resume
- GPT-4: ~$0.10/resume (10x more expensive)
- GPT-3.5: ~$0.005/resume

---

## 🎯 How It Works

### Resume Analysis Flow

```
1. Upload PDF/DOCX
   ↓
2. Extract text from file
   ↓
3. Send to Gemini Pro
   - Resume text
   - Job description
   - Scoring criteria
   ↓
4. Gemini analyzes and returns:
   - Overall score (0-10)
   - 5 detailed scores
   - Summary
   - 5 key highlights
   ↓
5. Save to MongoDB
   ↓
6. Display in Rankings
```

### What Gemini Evaluates

1. **Technical Skills Match (30%)**
   - Programming languages
   - Frameworks & tools
   - Technologies mentioned

2. **Years of Experience (25%)**
   - Total years in field
   - Relevant experience
   - Career progression

3. **Education Background (15%)**
   - Degrees & certifications
   - Institution quality
   - Relevant coursework

4. **Project Relevance (20%)**
   - Similar projects
   - Domain knowledge
   - Impact & scale

5. **Communication Skills (10%)**
   - Resume clarity
   - Writing quality
   - Presentation

---

## 🔧 Advanced Features

### 1. Batch Processing

Process multiple resumes at once:

```typescript
const results = await Promise.all(
  files.map(file => 
    fetch('/api/analyze-resume', {
      method: 'POST',
      body: JSON.stringify({ resumeText: file.text, jobId })
    })
  )
);
```

### 2. Custom Criteria

Use job-specific criteria:

```typescript
const criteria = [
  { name: 'Python Skills', weight: 40 },
  { name: 'Machine Learning', weight: 30 },
  { name: 'Research Experience', weight: 20 },
  { name: 'Publications', weight: 10 },
];
```

### 3. Multimodal (Images)

Gemini can read resume images (future feature):

```typescript
const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

const result = await model.generateContent([
  'Analyze this resume image',
  { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } }
]);
```

---

## ✅ Advantages of Gemini

1. **FREE** - No cost for most use cases
2. **Fast** - Quick response times
3. **Accurate** - High quality analysis
4. **Multimodal** - Can process images
5. **No credit card** - Start immediately
6. **60 RPM free** - More than enough for most apps
7. **Google backed** - Reliable infrastructure

---

## 🆘 Troubleshooting

### Error: "API key not valid"
**Fix:** 
- Check if key is correct in `.env.local`
- Make sure it starts with `AIza`
- Restart your server after adding key

### Error: "Resource exhausted"
**Fix:**
- You hit rate limit (60/min or 1,500/day)
- Wait a minute and try again
- For production, implement queueing

### Error: "Failed to parse JSON"
**Fix:**
- Gemini sometimes adds markdown formatting
- My code already handles this with `.replace()`
- If still failing, check the raw response

### Poor quality scores
**Fix:**
- Add more context to prompts
- Include example resumes
- Adjust criteria weights
- Provide clearer job descriptions

---

## 🚀 Next Steps

1. ✅ Get API key from Google AI Studio
2. ✅ Install `@google/generative-ai` package
3. ✅ Add key to `.env.local`
4. ✅ Create API routes
5. ✅ Test with sample resume
6. ✅ Integrate with upload flow
7. ✅ Deploy to production

---

## 📊 Expected Results

After setup, you'll be able to:
- ✅ Upload resumes → Get AI scores instantly
- ✅ Analyze LinkedIn profiles → Get detailed evaluation
- ✅ Rank candidates → Sort by AI score
- ✅ View insights → AI-generated summaries
- ✅ Save to database → Persistent storage

**All completely FREE with Gemini!** 🎉

---

## 📚 Resources

- Gemini API Docs: https://ai.google.dev/docs
- Get API Key: https://makersuite.google.com/app/apikey
- Pricing: https://ai.google.dev/pricing
- Cookbook: https://github.com/google/generative-ai-docs

---

**Ready to get started?** Get your free API key and let's test it! 🚀

