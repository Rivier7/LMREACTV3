import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Download, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import FileUploader from '../components/FileUploader';
import ErrorMessage from '../components/ErrorMessage';
import { getAccountExcel } from '../api/api';
import { useAccounts } from '../hooks/useAccountQueries';
import { useLaneCounts } from '../hooks/useLaneQueries';

function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  // React Query automatically handles loading, error, and caching!
  // No more useState, useEffect, or manual error handling needed
  const { data: accounts = [], isLoading: accountsLoading, error: accountsError } = useAccounts();

  const {
    data: counts = { total: 0, valid: 0, invalid: 0 },
    isLoading: countsLoading,
    error: countsError,
  } = useLaneCounts();

  const handleSelectAccount = accountId => {
    console.log(`Selected account ID: ${accountId}`);
    navigate(`/accountLanes/${accountId}`);
  };

  // Combined loading state
  const isLoading = accountsLoading || countsLoading;
  // Combined error state
  const error = accountsError || countsError;

  if (isLoading) {
    return <div className="text-center py-12 text-lg text-gray-500">Loading dashboard...</div>;
  }

  const validPercentage = counts.total > 0 ? (counts.valid / counts.total) * 100 : 0;
  const invalidPercentage = counts.total > 0 ? (counts.invalid / counts.total) * 100 : 0;

  // Filter accounts
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.accountName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'valid' && account.validCount > 0 && account.invalidCount === 0) ||
      (statusFilter === 'invalid' && account.invalidCount > 0);
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
              <p className="text-gray-600">Manage and monitor your account lanes</p>
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

          {/* Account Overview Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Accounts</h2>
                <p className="text-gray-600 text-sm mt-1">
                  {filteredAccounts.length} of {accounts.length} accounts
                </p>
              </div>
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                {accounts.length} Active
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by account name..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${statusFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('valid')}
                  className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${statusFilter === 'valid'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Valid
                </button>
                <button
                  onClick={() => setStatusFilter('invalid')}
                  className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${statusFilter === 'invalid'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Invalid
                </button>
              </div>
            </div>

            {/* No Results */}
            {filteredAccounts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No accounts match your filters</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAccounts.map(account => (
                <div
                  key={account.accountId}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {account.accountName}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">ID: {account.accountId}</p>
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
                        <p className="text-2xl font-bold text-blue-600">{account.totalCount}</p>
                        <p className="text-xs text-gray-500 mt-1">Total</p>
                      </div>
                      <div className="text-center border-l border-r border-gray-100">
                        <p className="text-2xl font-bold text-green-600">{account.validCount}</p>
                        <p className="text-xs text-gray-500 mt-1">Active</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{account.invalidCount}</p>
                        <p className="text-xs text-gray-500 mt-1">Invalid</p>
                      </div>
                    </div>

                    {/* Description */}
                    {account.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-5 pb-5 border-b border-gray-100">
                        {account.description}
                      </p>
                    )}

                    {/* Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={() => handleSelectAccount(account.accountId)}
                        className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 flex items-center justify-center gap-2"
                        aria-label={`Select account ${account.accountName}`}
                      >
                        View Lanes
                        <ChevronRight size={16} />
                      </button>

                      <button
                        onClick={() => getAccountExcel(account.accountId)}
                        className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 flex items-center justify-center gap-2"
                        aria-label={`Download excel for account ${account.accountName}`}
                      >
                        <Download size={16} />
                        Export
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
