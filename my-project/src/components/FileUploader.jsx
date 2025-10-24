import React, { useState, useRef } from "react";
import { postAccountExcel, downloadExcelTemplate } from '../api/api';

export default function FileUploader() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  function handleFileChange(e) {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setUploadStatus("");
    }
  }

  async function handleUpload() {
    if (!file) return;

    setLoading(true);
    try {
      await postAccountExcel(file);
      setUploadStatus("success");

      setTimeout(() => {
        setUploadStatus("");
        setFile(null);
        fileInputRef.current.value = null;
        setLoading(false);
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Upload failed", error);
      setUploadStatus("error");
      setLoading(false);
    }
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
        className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md bg-white hover:bg-blue-500 hover:text-white transition-colors"
        onClick={() => downloadExcelTemplate().catch(err => { console.error('Download template failed', err); alert('Failed to download template'); })}
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
            className="px-4 py-2 border border-green-600 text-green-600 rounded-md bg-white hover:bg-green-600 hover:text-white transition-colors"
            onClick={handleUpload}
          >
            Upload
          </button>
        </>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center mt-4">
          <div className="border-8 border-gray-200 border-t-blue-500 rounded-full w-12 h-12 animate-spin"></div>
        </div>
      )}

      {/* Success / Error Messages */}
      {uploadStatus === "success" && (
        <p className="text-green-600 font-bold mt-2">File uploaded successfully!</p>
      )}
      {uploadStatus === "error" && (
        <p className="text-red-600 font-bold mt-2">There was an error uploading the file.</p>
      )}
    </div>
  );
}
