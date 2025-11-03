'use client';

import { useState } from 'react';
import Modal from './Modal';
import { Job } from '../types';

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (job: Omit<Job, 'id' | 'candidateCount'>) => void;
}

export default function NewJobModal({ isOpen, onClose, onSubmit }: NewJobModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a job title');
      return;
    }

    onSubmit({
      title: formData.title,
      description: formData.description,
      postedDate: 'Just now',
    });

    // Reset form
    setFormData({ title: '', description: '' });
    onClose();
  };

  const handleClose = () => {
    setFormData({ title: '', description: '' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Job Post">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Job Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Senior Frontend Developer"
            className="w-full bg-[#0f0f1e] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>

        {/* Job Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Job Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the role, requirements, and qualifications..."
            rows={8}
            className="w-full bg-[#0f0f1e] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-2">
            Provide details about the position to help AI evaluate candidates more accurately
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
          >
            Create Job Post
          </button>
        </div>
      </form>
    </Modal>
  );
}

