export const dynamic = "force-dynamic";
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpDown, Trash2 } from 'lucide-react';
import { Candidate } from '../types';

type SortField = 'name' | 'score' | 'email';
type SortOrder = 'asc' | 'desc';

export default function Rankings() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState('');

  useEffect(() => {
    if (!jobId) {
      setIsLoading(false);
      return;
    }
    fetchJobDetails();
    fetchCandidates();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      const data = await response.json();
      if (data.success) {
        setJobTitle(data.data.title);
      }
    } catch (error) {
      console.error('Error fetching job:', error);
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await fetch(`/api/candidates?jobId=${jobId}`);
      const data = await response.json();
      if (data.success) {
        const candidatesWithId = data.data.map((c: any) => ({
          ...c,
          id: c._id,
        }));
        setCandidates(candidatesWithId);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    const newOrder =
      sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);

    const sorted = [...candidates].sort((a, b) => {
      const aVal = field === 'score' ? a[field] : a[field].toLowerCase();
      const bVal = field === 'score' ? b[field] : b[field].toLowerCase();

      if (newOrder === 'asc') return aVal > bVal ? 1 : -1;
      else return aVal < bVal ? 1 : -1;
    });

    setCandidates(sorted);
  };

  const handleDeleteCandidate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this candidate?')) return;
    try {
      const response = await fetch(`/api/candidates/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setCandidates(candidates.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error('Error deleting candidate:', error);
      alert('Failed to delete candidate. Please try again.');
    }
  };

  if (!jobId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            No job selected. Please return to the dashboard and choose a job to
            view its candidates.
          </p>
          <Link
            href="/"
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-400">Loading candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-400">
        <Link href="/" className="hover:text-white">
          Dashboard
        </Link>{' '}
        / {jobTitle || 'Job'} - Candidate Rankings
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {jobTitle || 'Job'} Candidate Rankings
        </h1>
        <div className="text-sm text-gray-400">
          {candidates.length} candidates evaluated
        </div>
      </div>

      {candidates.length === 0 ? (
        <div className="bg-[#1a1838] border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400 mb-4">No candidates uploaded yet</p>
          <Link
            href={`/upload?jobId=${jobId}`}
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Upload CVs →
          </Link>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-[#1a1838] border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0f0f1e] border-b border-gray-800">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">
                      Rank
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-2 hover:text-white transition-colors"
                      >
                        Candidate
                        <ArrowUpDown size={14} />
                      </button>
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">
                      <button
                        onClick={() => handleSort('email')}
                        className="flex items-center gap-2 hover:text-white transition-colors"
                      >
                        Email
                        <ArrowUpDown size={14} />
                      </button>
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">
                      <button
                        onClick={() => handleSort('score')}
                        className="flex items-center gap-2 hover:text-white transition-colors"
                      >
                        Score
                        <ArrowUpDown size={14} />
                      </button>
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate, index) => (
                    <tr
                      key={candidate.id}
                      className="border-b border-gray-800 hover:bg-[#0f0f1e] transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-400">#{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{candidate.name}</div>
                        <div className="text-sm text-gray-400">
                          {candidate.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {candidate.email}
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center justify-center bg-indigo-600 text-white font-bold px-4 py-2 rounded-full text-lg min-w-[70px]">
                          {candidate.score.toFixed(1)}
                        </div>
                      </td>
                      <td className="px-6 py-4 flex items-center gap-4">
                        <Link
                          href={`/details?candidateId=${candidate.id}`}
                          className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                        >
                          View Details →
                        </Link>
                        <button
                          onClick={() => handleDeleteCandidate(candidate.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete candidate"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stats Footer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1a1838] border border-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Average Score</div>
              <div className="text-2xl font-bold text-indigo-400">
                {(
                  candidates.reduce((sum, c) => sum + c.score, 0) /
                  candidates.length
                ).toFixed(1)}
              </div>
            </div>
            <div className="bg-[#1a1838] border border-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Top Score</div>
              <div className="text-2xl font-bold text-green-400">
                {Math.max(...candidates.map((c) => c.score)).toFixed(1)}
              </div>
            </div>
            <div className="bg-[#1a1838] border border-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Qualified (8.0+)</div>
              <div className="text-2xl font-bold text-purple-400">
                {candidates.filter((c) => c.score >= 8.0).length}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}