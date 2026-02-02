import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Download, ChevronRight, Trash2 } from 'lucide-react';
import Header from '../components/Header';
import FileUploader from '../components/FileUploader';
import ErrorMessage from '../components/ErrorMessage';
import { getLaneMappingExcel, deleteLaneMappingById } from '../api/api';
import { useLaneMappings } from '../hooks/useLaneMappingQueries';
import { useLaneCounts } from '../hooks/useLaneQueries';

function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  // React Query automatically handles loading, error, and caching!
  // No more useState, useEffect, or manual error handling needed
  const { data: laneMappings = [], isLoading: laneMappingsLoading, error: laneMappingsError, refetch: refetchLaneMappings } = useLaneMappings();

  const {
    data: counts = { total: 0, valid: 0, invalid: 0 },
    isLoading: countsLoading,
    error: countsError,
  } = useLaneCounts();

  const handleSelectLaneMapping = laneMappingId => {
    navigate(`/laneMappingLanes/${laneMappingId}`);
  };

  const handleDeleteLaneMapping = async (laneMappingId, laneMappingName) => {
    if (deleteConfirm !== laneMappingId) {
      setDeleteConfirm(laneMappingId);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteLaneMappingById(laneMappingId);
      await refetchLaneMappings();
      setDeleteConfirm(null);
    } catch (error) {
      alert(error.message || `Failed to delete lane mapping ${laneMappingName}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Combined loading state
  const isLoading = laneMappingsLoading || countsLoading;
  // Combined error state
  const error = laneMappingsError || countsError;

  if (isLoading) {
    return <div className="text-center py-12 text-lg text-gray-500">Loading dashboard...</div>;
  }

  const validPercentage = counts.total > 0 ? (counts.valid / counts.total) * 100 : 0;
  const invalidPercentage = counts.total > 0 ? (counts.invalid / counts.total) * 100 : 0;

  // Filter lane mappings
  const filteredLaneMappings = laneMappings.filter(laneMapping => {
    const matchesSearch = laneMapping.laneMappingName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'valid' && laneMapping.validCount > 0 && laneMapping.invalidCount === 0) ||
      (statusFilter === 'invalid' && laneMapping.invalidCount > 0);
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          {/* Display error message if any */}
          {error && (
            <ErrorMessage
              message={error.message || 'Failed to load dashboard data'}
              title="Error Loading Dashboard"
              severity="error"
              className="mb-6"
            />
          )}

          {/* Top Section */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-10">
            {/* Left: Title & Upload */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Manage and monitor your lane mappings</p>
              <div className="mt-6">
                <FileUploader />
              </div>
            </div>

            {/* Right: Stats Cards */}
            <div className="grid grid-cols-3 gap-4 flex-shrink-0">
              {/* Total Lanes */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Lanes</p>
                    <p className="text-3xl font-bold text-gray-900">{counts.total ?? 0}</p>
                  </div>
                  <div className="text-blue-600 text-3xl opacity-20">
                    <TrendingUp size={32} />
                  </div>
                </div>
              </div>

              {/* Active Lanes */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Active</p>
                    <p className="text-3xl font-bold text-green-600">{counts.valid ?? 0}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {validPercentage.toFixed(0)}% healthy
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-bold text-lg">✓</span>
                  </div>
                </div>
              </div>

              {/* Invalid Lanes */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Invalid</p>
                    <p className="text-3xl font-bold text-red-600">{counts.invalid ?? 0}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {invalidPercentage.toFixed(0)}% attention
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 font-bold text-lg">!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lane Mapping Overview Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Lane Mappings</h2>
                <p className="text-gray-600 text-sm mt-1">
                  {filteredLaneMappings.length} of {laneMappings.length} lane mappings
                </p>
              </div>
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                {laneMappings.length} Active
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by lane mapping name..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                    statusFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('valid')}
                  className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                    statusFilter === 'valid'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Valid
                </button>
                <button
                  onClick={() => setStatusFilter('invalid')}
                  className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                    statusFilter === 'invalid'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Invalid
                </button>
              </div>
            </div>

            {/* No Results */}
            {filteredLaneMappings.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No lane mappings match your filters</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLaneMappings.map(laneMapping => (
                <div
                  key={laneMapping.laneMappingId}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {laneMapping.laneMappingName}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">ID: {laneMapping.laneMappingId}</p>
                      </div>
                      <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Active
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{laneMapping.totalCount}</p>
                        <p className="text-xs text-gray-500 mt-1">Total</p>
                      </div>
                      <div className="text-center border-l border-r border-gray-100">
                        <p className="text-2xl font-bold text-green-600">{laneMapping.validCount}</p>
                        <p className="text-xs text-gray-500 mt-1">Active</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{laneMapping.invalidCount}</p>
                        <p className="text-xs text-gray-500 mt-1">Invalid</p>
                      </div>
                    </div>

                    {/* Description */}
                    {laneMapping.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-5 pb-5 border-b border-gray-100">
                        {laneMapping.description}
                      </p>
                    )}

                    {/* Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={() => handleSelectLaneMapping(laneMapping.laneMappingId)}
                        className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 flex items-center justify-center gap-2"
                        aria-label={`Select lane mapping ${laneMapping.laneMappingName}`}
                      >
                        View Lanes
                        <ChevronRight size={16} />
                      </button>

                      <button
                        onClick={() => getLaneMappingExcel(laneMapping.laneMappingId)}
                        className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 flex items-center justify-center gap-2"
                        aria-label={`Download excel for lane mapping ${laneMapping.laneMappingName}`}
                      >
                        <Download size={16} />
                        Export
                      </button>

                      <button
                        onClick={() => handleDeleteLaneMapping(laneMapping.laneMappingId, laneMapping.laneMappingName)}
                        disabled={isDeleting}
                        className={`w-full px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                          deleteConfirm === laneMapping.laneMappingId
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-gray-100 text-red-600 hover:bg-red-50'
                        } disabled:opacity-50`}
                        aria-label={`Delete lane mapping ${laneMapping.laneMappingName}`}
                      >
                        <Trash2 size={16} />
                        {deleteConfirm === laneMapping.laneMappingId ? 'Click to Confirm' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default Dashboard;
