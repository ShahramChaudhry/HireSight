'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';
import NewJobModal from './components/NewJobModal';
import { Job } from './types';

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate statistics
  const totalJobs = jobs.length;
  const totalCVs = jobs.reduce((sum, job) => sum + job.candidateCount, 0);

  const stats = [
    { label: 'Active Jobs', value: totalJobs, color: 'text-indigo-400' },
    { label: 'Total CVs', value: totalCVs, color: 'text-indigo-400' },
  ];

  // Fetch jobs on component mount
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      const data = await response.json();
      if (data.success) {
        setJobs(data.data.map((job: any) => ({ ...job, id: job._id })));
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateJob = async (jobData: Omit<Job, 'id' | 'candidateCount'>) => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });
      const data = await response.json();
      if (data.success) {
        setJobs([{ ...data.data, id: data.data._id }, ...jobs]);
      }
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job. Please try again.');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job post?')) return;

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setJobs(jobs.filter((job) => job.id !== jobId));
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-400">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-800 pb-6">
        <h1 className="text-2xl font-semibold text-gray-300">Active Job Posts</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[#1a1838] border border-gray-800 rounded-xl p-8 text-center"
          >
            <div className={`text-5xl font-bold mb-2 ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-gray-400 text-lg">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Job Posts Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Active Job Posts</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            New Job Post
          </button>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="bg-[#1a1838] border border-gray-800 rounded-xl p-12 text-center">
              <p className="text-gray-400 mb-4">No job posts yet</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                <Plus size={20} />
                Create Your First Job Post
              </button>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="bg-[#1a1838] border border-gray-800 rounded-xl p-6 hover:border-indigo-700 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                    <p className="text-gray-400 text-sm">
                      {job.candidateCount} candidates • Posted {job.postedDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all p-2"
                      title="Delete job post"
                    >
                      <Trash2 size={18} />
                    </button>
                    <Link
                      href={`/criteria?jobId=${job.id}`}
                      className="bg-indigo-700 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                    >
                      Criteria
                    </Link>
                    <Link
                      href={`/upload?jobId=${job.id}`}
                      className="bg-purple-700 hover:bg-purple-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                    >
                      Upload CVs
                    </Link>
                    <Link
                      href={`/rankings?jobId=${job.id}`}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                    >
                      View Candidates
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Job Modal */}
      <NewJobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateJob}
      />
    </div>
  );
}