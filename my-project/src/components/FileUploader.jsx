import React, { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { downloadExcelTemplate, uploadExcelWithProgress } from '../api/api';
import { laneMappingKeys } from '../hooks/useLaneMappingQueries';
import ErrorMessage from './ErrorMessage';

export default function FileUploader() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success' | 'error' | null
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState({
    percentage: 0,
    message: '',
    currentRow: 0,
    totalRows: 0,
    currentSheet: '',
    status: '',
  });
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  function handleFileChange(e) {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setUploadStatus(null);
      setErrorMessage('');
    }
  }

  async function handleUpload() {
    if (!file) return;

    setIsUploading(true);
    setUploadStatus(null);
    setErrorMessage('');
    setProgress({
      percentage: 0,
      message: 'Starting upload...',
      currentRow: 0,
      totalRows: 0,
      currentSheet: '',
      status: 'processing',
    });

    try {
      await uploadExcelWithProgress(file, {
        onProgress: data => {
          setProgress({
            percentage: data.percentage || 0,
            message: data.message || '',
            currentRow: data.currentRow || 0,
            totalRows: data.totalRows || 0,
            currentSheet: data.currentSheet || '',
            status: data.status || 'processing',
          });
        },
        onError: data => {
          setErrorMessage(data.message || 'Upload failed');
          setUploadStatus('error');
        },
        onComplete: data => {
          setProgress(prev => ({
            ...prev,
            percentage: 100,
            status: 'completed',
            message: data.message || 'Upload completed successfully!',
          }));
          setUploadStatus('success');
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: laneMappingKeys.all });
        },
      });

      // Clear file after successful upload
      setTimeout(() => {
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = null;
        }
        // Reset progress after showing success
        setTimeout(() => {
          setProgress({
            percentage: 0,
            message: '',
            currentRow: 0,
            totalRows: 0,
            currentSheet: '',
            status: '',
          });
          setUploadStatus(null);
        }, 3000);
      }, 1500);
    } catch (error) {
      console.error('Upload failed', error);
      setErrorMessage(error.message || 'There was an error uploading the file');
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  }

  // Determine progress bar color based on status
  const getProgressBarColor = () => {
    switch (progress.status) {
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'validating':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 font-sans">
      {/* Top Row: Buttons and File Info */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Hidden File Input */}
        <input
          type="file"
          accept=".xls,.xlsx"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />

        {/* Choose File Button */}
        <button
          className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md bg-white hover:bg-blue-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => fileInputRef.current.click()}
          disabled={isUploading}
        >
          Choose File
        </button>

        {/* Download Template Button */}
        <button
          className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md bg-white hover:bg-blue-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() =>
            downloadExcelTemplate().catch(err => {
              console.error('Download template failed', err);
              alert('Failed to download template');
            })
          }
          disabled={isUploading}
        >
          Download Excel Template
        </button>

        {/* If file is selected */}
        {file && (
          <>
            <span className="font-bold text-gray-800 text-base max-w-xs truncate">
              {file.name}
            </span>
            <button
              className="px-4 py-2 border border-green-600 text-green-600 rounded-md bg-white hover:bg-green-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </>
        )}
      </div>

      {/* Progress Bar Section */}
      {isUploading && (
        <div className="w-full max-w-xl space-y-2">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-4 rounded-full transition-all duration-300 ease-out ${getProgressBarColor()}`}
              style={{ width: `${Math.max(progress.percentage, 2)}%` }}
            />
          </div>

          {/* Progress Details */}
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              {progress.currentRow > 0 && progress.totalRows > 0
                ? `Row ${progress.currentRow} of ${progress.totalRows}`
                : 'Initializing...'}
            </span>
            <span>{Math.round(progress.percentage)}%</span>
          </div>

          {/* Current Sheet */}
          {progress.currentSheet && (
            <p className="text-sm text-gray-500">
              Sheet: <span className="font-medium">{progress.currentSheet}</span>
            </p>
          )}

          {/* Status Message */}
          {progress.message && (
            <p className="text-sm text-gray-600 italic">{progress.message}</p>
          )}

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {progress.status === 'processing' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing
              </span>
            )}
            {progress.status === 'validating' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">
                <svg className="w-3 h-3 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                Validating
              </span>
            )}
          </div>
        </div>
      )}

      {/* Success Message */}
      {uploadStatus === 'success' && !isUploading && (
        <div className="flex items-center gap-2 text-green-600 font-bold">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          File uploaded successfully!
        </div>
      )}

      {/* Error Message */}
      {uploadStatus === 'error' && (
        <ErrorMessage
          message={errorMessage || 'There was an error uploading the file.'}
          title="Upload Error"
          severity="error"
          onDismiss={() => {
            setUploadStatus(null);
            setErrorMessage('');
          }}
          className="max-w-xl"
        />
      )}
    </div>
  );
}
