import React, { useState, useRef } from 'react';
import { downloadExcelTemplate } from '../api/api';
import { useUploadLaneMappingExcel } from '../hooks/useLaneMappingQueries';

export default function FileUploader() {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  // React Query mutation - automatically invalidates lane mapping queries on success!
  const uploadMutation = useUploadLaneMappingExcel();

  function handleFileChange(e) {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  }

  function handleUpload() {
    if (!file) return;

    // Trigger the mutation
    uploadMutation.mutate(file, {
      onSuccess: () => {
        // Clear file after successful upload
        setTimeout(() => {
          setFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = null;
          }
          // Data will automatically refresh due to query invalidation!
        }, 1500);
      },
      onError: error => {
        console.error('Upload failed', error);
        alert('There was an error uploading the file:\n' + error.message);
      },
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 font-sans">
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
        className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md bg-white hover:bg-blue-500 hover:text-white transition-colors"
        onClick={() => fileInputRef.current.click()}
      >
        Choose File
      </button>

      {/* Download Template Button */}
      <button
        className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md bg-white hover:bg-blue-500 hover:text-white transition-colors
"
        onClick={() =>
          downloadExcelTemplate().catch(err => {
            console.error('Download template failed', err);
            alert('Failed to download template');
          })
        }
      >
        Download Excel Template
      </button>

      {/* If file is selected */}
      {file && (
        <>
          <span className="font-bold text-gray-800 text-base max-w-xs truncate">{file.name}</span>
          <button
            className="px-4 py-2 border border-green-600 text-green-600 rounded-md bg-white hover:bg-green-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleUpload}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
          </button>
        </>
      )}

      {/* Loading Spinner */}
      {uploadMutation.isPending && (
        <div className="flex justify-center items-center mt-4">
          <div className="border-8 border-gray-200 border-t-blue-500 rounded-full w-12 h-12 animate-spin"></div>
        </div>
      )}

      {/* Success / Error Messages */}
      {uploadMutation.isSuccess && (
        <p className="text-green-600 font-bold mt-2">File uploaded successfully!</p>
      )}
      {uploadMutation.isError && (
        <p className="text-red-600 font-bold mt-2">There was an error uploading the file.</p>
      )}
    </div>
  );
}
