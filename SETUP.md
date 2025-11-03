# HireSight Setup Guide

## Quick Start

Follow these steps to get HireSight running on your local machine:

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

### 3. Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

## Application Structure

```
/app
  /components       # Reusable components
    Navigation.tsx  # Top navigation bar
  /data            # Mock data
    mockData.ts    # Sample jobs, candidates, and profiles
  /criteria        # Define evaluation criteria page
  /details         # Candidate detail view page
  /linkedin        # LinkedIn profile evaluation page
  /rankings        # Candidate rankings table page
  /upload          # CV upload page
  page.tsx         # Dashboard (home page)
  layout.tsx       # Root layout with navigation
  globals.css      # Global styles
  types.ts         # TypeScript type definitions
```

## Features Implemented

### ✅ Dashboard
- Active job posts overview
- Statistics cards (Active Jobs, Total CVs, Top Matches)
- Job listings with candidate counts
- Quick navigation to candidates

### ✅ Upload CVs
- Drag & drop file upload interface
- Multiple file support (PDF, DOCX, DOC)
- File management (remove individual files, clear all)
- File list with size information
- Process & Evaluate button

### ✅ Define Criteria
- Job description editor
- Customizable scoring criteria with weights
- Drag handles for reordering (UI ready)
- Real-time weight total calculation
- Validation (must total 100%)
- Add custom criteria
- Reset to defaults

### ✅ LinkedIn Evaluation
- LinkedIn profile URL input
- Profile analysis with scoring breakdown
- Skills & Endorsements matching
- Experience & Career progression evaluation
- Education & Certifications review
- Recommendations & Activity assessment
- Profile summary with AI insights
- Add to job candidates functionality

### ✅ Rankings
- Sortable candidate table
- Rank, name, email, score display
- Click column headers to sort
- Statistics footer (average, top score, qualified count)
- Direct link to candidate details

### ✅ Details
- Comprehensive candidate profile
- Overall score badge
- Score breakdown by category (5 metrics)
- Visual progress bars with color coding
- AI-generated evaluation summary
- Key highlights with checkmarks
- Action buttons (Download CV, Re-evaluate, Move to Next Stage)

## Pages & Routes

- `/` - Dashboard
- `/upload` - Upload CVs
- `/criteria` - Define Evaluation Criteria
- `/rankings` - View Candidate Rankings
- `/details?candidateId=X` - Candidate Details
- `/linkedin` - LinkedIn Profile Evaluation

## Design System

### Colors
- **Background**: `#0a0a14` (Deep navy)
- **Cards**: `#1a1838` (Navy 900)
- **Borders**: `#374151` (Gray 800)
- **Primary**: Indigo (600-700)
- **Accent**: Purple (for gradients)

### Typography
- System font stack for optimal performance
- Clear hierarchy with size and weight variations

### Components
- Consistent border-radius: `0.5rem` (rounded-lg) or `0.75rem` (rounded-xl)
- Hover states on interactive elements
- Smooth transitions
- Gradient buttons for primary actions

## Mock Data

The application includes sample data for:
- 4 job posts (Senior Frontend Developer, AI/ML Engineer, Product Designer, DevOps Engineer)
- 4 candidates with complete profiles and scores
- 1 LinkedIn profile example

To modify the data, edit `/app/data/mockData.ts`

## Next Steps (Future Enhancements)

- Connect to real backend API
- Implement actual file upload and parsing
- Add drag-and-drop reordering for criteria
- Integrate real LinkedIn API
- Add authentication
- Implement real AI evaluation
- Add candidate filtering and search
- Export functionality (PDF reports, CSV)
- Email notifications
- Interview scheduling

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State**: React Hooks

## Support

For issues or questions, refer to the [Next.js Documentation](https://nextjs.org/docs).

