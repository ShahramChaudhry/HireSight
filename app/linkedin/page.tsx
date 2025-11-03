'use client';

import { useState } from 'react';
import { mockLinkedInProfile } from '../data/mockData';
import { Lightbulb, User } from 'lucide-react';

export default function LinkedIn() {
  const [profileUrl, setProfileUrl] = useState('');
  const [profile, setProfile] = useState(mockLinkedInProfile);
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddedMessage, setShowAddedMessage] = useState(false);

  const handleEvaluate = async () => {
    if (!profileUrl.trim()) {
      alert('Please enter a LinkedIn profile URL');
      return;
    }
    
    setIsLoading(true);
    setIsEvaluated(false);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    setIsEvaluated(true);
    // In a real app, this would make an API call and set real profile data
  };

  const handleAddToJob = () => {
    setShowAddedMessage(true);
    setTimeout(() => {
      setShowAddedMessage(false);
    }, 3000);
  };

  const scoreCategories = [
    { name: 'Skills & Endorsements Match', score: profile.scores.skillsMatch },
    { name: 'Experience & Career Progression', score: profile.scores.experience },
    { name: 'Education & Certifications', score: profile.scores.education },
    { name: 'Recommendations & Activity', score: profile.scores.recommendations },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'bg-green-500';
    if (score >= 8) return 'bg-indigo-500';
    if (score >= 7) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-400">
        Senior Frontend Developer - LinkedIn Profile Evaluation
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold mb-2">LinkedIn Profile Evaluation</h1>
      </div>

      {/* URL Input */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-300">
          LinkedIn Profile URL
        </label>
        <input
          type="url"
          value={profileUrl}
          onChange={(e) => setProfileUrl(e.target.value)}
          placeholder="https://linkedin.com/in/username"
          className="w-full bg-[#1a1838] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button
          onClick={handleEvaluate}
          disabled={isLoading}
          className={`w-full py-4 rounded-lg font-medium text-lg transition-all ${
            isLoading
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
          }`}
        >
          {isLoading ? 'Fetching Profile...' : 'Fetch & Evaluate Profile'}
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-[#1a1838] border border-gray-800 rounded-xl p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-400">Analyzing LinkedIn profile...</p>
        </div>
      )}

      {/* Recent Evaluation */}
      {isEvaluated && (
        <>
          <div>
            <h2 className="text-lg font-semibold text-indigo-400 mb-4">
              Recent Evaluation
            </h2>
          </div>

          {/* Profile Card */}
          <div className="bg-[#1a1838] border border-gray-800 rounded-xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center">
                  <User size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">{profile.name}</h3>
                  <p className="text-gray-400 text-sm">{profile.title}</p>
                  <p className="text-gray-500 text-sm">
                    {profile.location} • {profile.connections}
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center justify-center bg-indigo-600 text-white font-bold px-6 py-3 rounded-full text-3xl min-w-[100px]">
                {profile.score.toFixed(1)}
              </div>
            </div>

            {/* LinkedIn Profile Analysis */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-indigo-400">
                LinkedIn Profile Analysis
              </h3>
              <div className="space-y-4">
                {scoreCategories.map((category) => (
                  <div key={category.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="text-sm font-bold">
                        {category.score.toFixed(1)}
                      </span>
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
          </div>

          {/* Profile Summary */}
          <div className="bg-[#1a1838] border border-indigo-800 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-indigo-400">Profile Summary</h3>
            <p className="text-gray-300 leading-relaxed">{profile.summary}</p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center"
            >
              View Full Profile
            </a>
            <button 
              onClick={handleAddToJob}
              className="bg-[#1a1838] border border-gray-700 text-gray-300 hover:bg-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Add to Job Candidates
            </button>
          </div>

          {/* Added Success Message */}
          {showAddedMessage && (
            <div className="bg-green-600/20 border border-green-600 rounded-lg p-4 flex items-center gap-3">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-green-400">{profile.name} added to job candidates!</p>
                <p className="text-sm text-green-400/80 mt-0.5">Check the Rankings page to see all candidates.</p>
              </div>
            </div>
          )}

          {/* Pro Tip */}
          <div className="bg-indigo-950/30 border border-indigo-800 rounded-xl p-5">
            <div className="flex gap-3">
              <Lightbulb size={20} className="text-indigo-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-indigo-400 mb-1">
                  Pro Tip
                </h4>
                <p className="text-sm text-gray-400">
                  LinkedIn evaluation considers skills, endorsements, recommendations,
                  career progression, and professional activity. For best results,
                  ensure the profile is public or you have appropriate access
                  permissions.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

