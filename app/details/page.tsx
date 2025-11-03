'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download, ArrowRight, Check } from 'lucide-react';
import { Candidate } from '../types';

export default function Details() {
  const searchParams = useSearchParams();
  const candidateId = searchParams.get('candidateId');
  
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [jobTitle, setJobTitle] = useState<string>(''); // ✅ dynamically fetched
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (candidateId) {
      fetchCandidate();
    }
  }, [candidateId]);

  const fetchCandidate = async () => {
    try {
      const response = await fetch(`/api/candidates/${candidateId}`);
      const data = await response.json();
      if (data.success) {
        const fetchedCandidate = { ...data.data, id: data.data._id };
        setCandidate(fetchedCandidate);

        // ✅ fetch job title using jobId from candidate
        if (fetchedCandidate.jobId) {
          const jobRes = await fetch(`/api/jobs/${fetchedCandidate.jobId}`);
          const jobData = await jobRes.json();
          if (jobData.success) {
            setJobTitle(jobData.data.title);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching candidate details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-400">Loading candidate details...</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Candidate not found</p>
          <a href="/rankings" className="text-indigo-400 hover:text-indigo-300">
            ← Back to Rankings
          </a>
        </div>
      </div>
    );
  }

  const scoreCategories = [
    { name: 'Technical Skills Match', score: candidate.scores.technicalSkills },
    { name: 'Years of Experience', score: candidate.scores.experience },
    { name: 'Education Background', score: candidate.scores.education },
    { name: 'Project Relevance', score: candidate.scores.projectRelevance },
    { name: 'Communication Skills', score: candidate.scores.communication },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'bg-green-500';
    if (score >= 8) return 'bg-indigo-500';
    if (score >= 7) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  // ✅ Construct email link with actual job title
  // ✅ Helper to normalize name case
  const formatName = (name: string) => {
    if (!name) return '';
    const first = name.split(' ')[0];
    return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  };

  // ✅ Construct email link with actual job title + formatted name
  const mailtoLink = `mailto:${candidate.email}?subject=${encodeURIComponent(
    `Next Stage: ${jobTitle || 'Interview'} Invitation`
  )}&body=${encodeURIComponent(
    `Hi ${formatName(candidate.name)},\n\nCongratulations on applying for the ${
      jobTitle || 'position'
    } role! We were impressed with your profile and would like to invite you to the next stage of our selection process.\n\nPlease let us know your availability for a short interview.\n\nBest regards,\nThe Hiring Team`
  )}`;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-400">
        Candidate Details - {candidate.name}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{candidate.name}</h1>
          <p className="text-gray-400">{candidate.email}</p>
          <p className="text-gray-400">{candidate.phone}</p>
        </div>
        <div className="inline-flex items-center justify-center bg-indigo-600 text-white font-bold px-6 py-3 rounded-full text-3xl min-w-[100px]">
          {candidate.score.toFixed(1)}
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="bg-[#1a1838] border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-indigo-400">Score Breakdown</h2>
        <div className="space-y-4">
          {scoreCategories.map((category) => (
            <div key={category.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{category.name}</span>
                <span className="text-sm font-bold">{category.score.toFixed(1)}</span>
              </div>
              <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full ${getScoreColor(
                    category.score
                  )} transition-all duration-500`}
                  style={{ width: `${category.score * 10}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Evaluation Summary */}
      <div className="bg-[#1a1838] border border-indigo-800 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-indigo-400">AI Evaluation Summary</h2>
        <p className="text-gray-300 leading-relaxed">{candidate.summary}</p>
      </div>

      {/* Key Highlights */}
      <div className="bg-[#1a1838] border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-indigo-400">Key Highlights</h2>
        <ul className="space-y-3">
          {candidate.highlights.map((highlight, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check size={20} className="text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300">{highlight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Download CV */}
        <button className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          <Download size={20} />
          Download CV
        </button>

        {/* ✅ Move to Next Stage */}
        <a
          href={mailtoLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Move to Next Stage
          <ArrowRight size={20} />
        </a>
      </div>
    </div>
  );
}