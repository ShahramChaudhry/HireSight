'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Upload as UploadIcon, X, FileText } from 'lucide-react';
import { UploadedFile } from '../types';

export default function Upload() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const filesMapRef = useRef<Map<string, File>>(new Map());
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [processedCount, setProcessedCount] = useState(0);

  // Fetch job details
  useEffect(() => {
    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const fetchJob = async () => {
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file drop
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file, index) => {
      const id = `${Date.now()}-${index}`;
      // Store the actual File object in the ref
      filesMapRef.current.set(id, file);
      return {
        id,
        name: file.name,
        size: Math.round(file.size / 1024), // Convert to KB
        file: file, // Keep for type compatibility
      };
    });
    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };

  const removeFile = (id: string) => {
    filesMapRef.current.delete(id);
    setUploadedFiles(uploadedFiles.filter((file) => file.id !== id));
  };

  const clearAll = () => {
    filesMapRef.current.clear();
    setUploadedFiles([]);
  };

  const handleProcess = async () => {
    if (!jobId) {
      alert('No job selected. Please select a job from the dashboard.');
      return;
    }
  
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one file');
      return;
    }
  
    setIsProcessing(true);
    setShowSuccess(false);
    setProcessedCount(0);
  
    try {
      let successCount = 0;
  
      for (const uploadedFile of uploadedFiles) {
        try {
          const actualFile = filesMapRef.current.get(uploadedFile.id);
          if (!actualFile) {
            console.error(`File not found for ${uploadedFile.name}`);
            continue;
          }
  
          const formData = new FormData();
          formData.append('file', actualFile);
          formData.append('jobId', jobId);
  
          const response = await fetch('/api/upload-resume', {
            method: 'POST',
            body: formData,
          });
  
          let data;
          try {
            data = await response.json();
          } catch {
            throw new Error('Invalid server response');
          }
  
          if (!response.ok) throw new Error(data.error || 'Server error');
  
          if (data.success) {
            successCount++;
            setProcessedCount(successCount);
            console.log(`✅ Processed ${uploadedFile.name}`);
          } else {
            throw new Error(data.error || 'Failed to analyze');
          }
        } catch (err: any) {
          console.error(`Error processing ${uploadedFile.name}:`, err);
          alert(`❌ ${uploadedFile.name}: ${err.message}`);
        }
      }
  
      setIsProcessing(false);
      setShowSuccess(true);
  
      setTimeout(() => {
        setShowSuccess(false);
        window.location.href = `/rankings?jobId=${jobId}`;
      }, 3000);
    } catch (error) {
      console.error('Upload process failed:', error);
      setIsProcessing(false);
      alert('Failed to process files. Please try again.');
    }
  };

  if (!jobId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No job selected</p>
          <p className="text-sm text-gray-500 mb-4">Please select a job from the dashboard to upload CVs</p>
          <a href="/" className="text-indigo-400 hover:text-indigo-300">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-400">
        <a href="/" className="hover:text-white">Dashboard</a> / {jobTitle || 'Job'} - Upload Candidate CVs
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold mb-2">Upload Candidate CVs</h1>
        <p className="text-gray-400">for {jobTitle}</p>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-gray-700 bg-[#1a1838]'
        }`}
      >
        <div className="flex flex-col items-center space-y-4">
          <FileText size={48} className="text-gray-500" />
          <div>
            <p className="text-lg mb-1">Drag & drop files here</p>
            <p className="text-sm text-gray-400">or click to browse</p>
          </div>
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <span className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
              Select Files
            </span>
          </label>
          <p className="text-xs text-gray-500">
            Supported formats: PDF, DOCX, DOC • Maximum 50 files per upload
          </p>
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Uploaded Files ({uploadedFiles.length})
            </h2>
            <button
              onClick={clearAll}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="bg-[#1a1838] border border-gray-800 rounded-lg p-4 flex items-center justify-between hover:border-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-gray-400" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-400">{file.size} KB</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>

          {/* Process Button */}
          <button 
            onClick={handleProcess}
            disabled={isProcessing}
            className={`w-full py-4 rounded-lg font-medium text-lg transition-all ${
              isProcessing 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
            }`}
          >
            {isProcessing 
              ? `Processing CVs with AI... (${processedCount}/${uploadedFiles.length})` 
              : 'Process & Evaluate CVs with AI'}
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
                <p className="font-medium text-green-400">Successfully processed {processedCount} CVs with AI!</p>
                <p className="text-sm text-green-400/80 mt-0.5">Candidates have been evaluated and ranked. Redirecting...</p>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-indigo-950/30 border border-indigo-800 rounded-lg p-4">
            <p className="text-sm text-indigo-300">
              <strong>🤖 AI-Powered Analysis:</strong> Each resume will be analyzed using Google Gemini AI based on your job criteria. The AI will extract candidate details, evaluate skills, and provide detailed scores and insights.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

