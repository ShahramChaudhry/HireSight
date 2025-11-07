# 💼 HireSight

**HireSight** is an AI-powered recruitment platform that helps recruiters evaluate candidates intelligently through **CV analysis** and **LinkedIn profile evaluation**.  
It combines automation, custom scoring, and AI-driven insights to make the hiring process faster, fairer, and data-informed.

---

## 🚀 Features

- 📊 **Dashboard:** View all active job posts and candidate statistics in one place  
- 📂 **Upload CVs:** Bulk upload resumes for instant AI-based analysis  
- ⚙️ **Define Criteria:** Create custom evaluation criteria with weighted scoring  
- 🏅 **Candidate Rankings:** Automatically rank candidates based on their total weighted scores  
- 🧠 **Detailed AI Analysis:** Generate smart summaries, individual score breakdowns, and key highlights for each candidate  

---

## 🧩 Tech Stack

- **Next.js 14** – React framework for server-side rendering and API routes  
- **TypeScript** – Type safety and maintainability  
- **Tailwind CSS** – Modern, utility-first styling  
- **Google Gemini API** – AI-powered text analysis and evaluation  

---

## 💡 Challenges & Learnings

Building HireSight was both a rewarding and technically intricate experience.

**1. Prompt Engineering with Gemini**

Designing a reliable prompt for the AI model was the biggest challenge.
Early versions would output inconsistent or incomplete JSON. Refining the prompt to always return structured, valid JSON took careful iteration.

**2. Converting Gemini’s Output into Usable Data**

Another challenge was safely parsing and normalizing the AI’s response into numeric scores.
Even small inconsistencies (like "10" as a string vs. 10 as a number) could cause runtime errors during database insertion or score computation.

**3. The “Extra Space” Bug**

This was the trickiest one. Gemini occasionally returned criterion names with hidden trailing spaces, like "Marketing Tools & Digital Skills   ".
This caused valid scores to be skipped because the names didn’t match exactly.
After hours of debugging prompt logic, the fix turned out to be simple: trimming key names before mapping them.
A small detail, but a huge relief once found!


## Reflections

Working on HireSight was genuinely enjoyable, it combined AI, full-stack development, and data interpretation in one project.
It pushed me to think deeply about prompt design, data consistency, and how small details can break complex systems. Overall, it was a great blend of creativity and problem-solving, and I’m proud of how it turned out.

## Demo
Deployed App: https://hire-sight-nine.vercel.app
Demo Video: https://drive.google.com/file/d/1khCCBLxjfKEUfywFaVn6dDt8ftG2ldQP/view?usp=sharing
