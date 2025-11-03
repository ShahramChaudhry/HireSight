'use client';
export const dynamic = "force-dynamic";


import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { GripVertical, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { ScoringCriterion } from '../types';

export default function Criteria() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');
  
  const [criteria, setCriteria] = useState<ScoringCriterion[]>([
    { id: '1', name: 'Technical Skills Match', weight: 30 },
    { id: '2', name: 'Years of Experience', weight: 25 },
    { id: '3', name: 'Education Background', weight: 15 },
    { id: '4', name: 'Project Relevance', weight: 20 },
    { id: '5', name: 'Communication Skills', weight: 10 },
  ]);

  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch job and criteria on mount
  useEffect(() => {
    if (jobId) {
      fetchJobAndCriteria();
    } else {
      setIsLoading(false);
    }
  }, [jobId]);

  const fetchJobAndCriteria = async () => {
    try {
      const jobResponse = await fetch(`/api/jobs/${jobId}`);
      const jobData = await jobResponse.json();
      if (jobData.success) {
        setJobTitle(jobData.data.title);
        setJobDescription(jobData.data.description || '');
      }

      const criteriaResponse = await fetch(`/api/criteria?jobId=${jobId}`);
      const criteriaData = await criteriaResponse.json();
      if (criteriaData.success && criteriaData.data) {
        setCriteria(criteriaData.data.criteria);
        if (criteriaData.data.jobDescription) {
          setJobDescription(criteriaData.data.jobDescription);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  const handleWeightChange = (id: string, newWeight: number) => {
    setCriteria(
      criteria.map((c) => (c.id === id ? { ...c, weight: newWeight } : c))
    );
  };

  const handleNameChange = (id: string, newName: string) => {
    setCriteria(
      criteria.map((c) => (c.id === id ? { ...c, name: newName } : c))
    );
  };

  const addCriterion = () => {
    const newId = String(Date.now());
    setCriteria([
      ...criteria,
      { id: newId, name: 'New Criterion', weight: 0 },
    ]);
  };

  const handleDeleteCriterion = (id: string) => {
    if (criteria.length <= 1) {
      alert('You must have at least one criterion.');
      return;
    }
    if (confirm('Are you sure you want to delete this criterion?')) {
      setCriteria(criteria.filter((c) => c.id !== id));
    }
  };

  const resetToDefaults = () => {
    setCriteria([
      { id: '1', name: 'Technical Skills Match', weight: 30 },
      { id: '2', name: 'Years of Experience', weight: 25 },
      { id: '3', name: 'Education Background', weight: 15 },
      { id: '4', name: 'Project Relevance', weight: 20 },
      { id: '5', name: 'Communication Skills', weight: 10 },
    ]);
  };

  const handleSave = async () => {
    if (!jobId) {
      alert('No job selected');
      return;
    }

    setIsSaving(true);
    setShowSuccess(false);
    
    try {
      const response = await fetch('/api/criteria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          jobDescription,
          criteria,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsSaving(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error saving criteria:', error);
      alert('Failed to save criteria. Please try again.');
      setIsSaving(false);
    }
  };

  if (!jobId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No job selected</p>
          <a href="/" className="text-indigo-400 hover:text-indigo-300">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-400">Loading criteria...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-400">
        <a href="/" className="hover:text-white">Dashboard</a> / {jobTitle || 'Job'} - Define Evaluation Criteria
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold mb-2">Define Evaluation Criteria</h1>
        <p className="text-gray-400">for {jobTitle}</p>
      </div>

      {/* Job Description */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-300">
          Job Description
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={6}
          className="w-full bg-[#1a1838] border border-gray-700 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Scoring Criteria */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-1 text-indigo-400">Scoring Criteria</h2>
          <p className="text-sm text-gray-400">
            Weights must total 100%
          </p>
        </div>

        <div className="space-y-3">
          {criteria.map((criterion) => (
            <div
              key={criterion.id}
              className="group bg-[#1a1838] border border-gray-800 rounded-lg p-4 flex items-center justify-between hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <GripVertical size={20} className="text-gray-600 cursor-move" />
                <input
                  type="text"
                  value={criterion.name}
                  onChange={(e) => handleNameChange(criterion.id, e.target.value)}
                  placeholder="Enter criterion name"
                  className="flex-1 bg-[#0f0f1e] border border-gray-700 rounded px-3 py-2 font-medium text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={criterion.weight}
                  onChange={(e) =>
                    handleWeightChange(criterion.id, parseInt(e.target.value) || 0)
                  }
                  className="w-20 bg-[#0f0f1e] border border-gray-700 rounded px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium bg-indigo-600 px-3 py-2 rounded min-w-[100px] text-center">
                  Weight: {criterion.weight}%
                </span>

                {/* Delete button (only visible on hover) */}
                <button
                  onClick={() => handleDeleteCriterion(criterion.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-md hover:bg-red-600/20 text-red-400"
                  title="Delete criterion"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Total Weight Indicator */}
        <div
          className={`text-center py-2 rounded-lg font-medium ${
            totalWeight === 100
              ? 'bg-green-600/20 text-green-400'
              : 'bg-red-600/20 text-red-400'
          }`}
        >
          Total Weight: {totalWeight}% {totalWeight !== 100 && '(Must equal 100%)'}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={addCriterion}
            className="flex-1 flex items-center justify-center gap-2 bg-[#1a1838] border border-indigo-600 text-indigo-400 hover:bg-indigo-600/10 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            Add Custom Criterion
          </button>
          <button
            onClick={resetToDefaults}
            className="flex-1 flex items-center justify-center gap-2 bg-[#1a1838] border border-gray-700 text-gray-400 hover:bg-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <RotateCcw size={20} />
            Reset to Defaults
          </button>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={totalWeight !== 100 || isSaving}
        className={`w-full py-4 rounded-lg font-medium text-lg transition-all ${
          totalWeight === 100 && !isSaving
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isSaving ? 'Saving...' : 'Save Criteria & Continue'}
      </button>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-600/20 border border-green-600 rounded-lg p-4 flex items-center gap-3">
          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-green-400">Criteria saved successfully!</p>
            <p className="text-sm text-green-400/80 mt-0.5">Your evaluation criteria have been updated.</p>
          </div>
        </div>
      )}
    </div>
  );
}