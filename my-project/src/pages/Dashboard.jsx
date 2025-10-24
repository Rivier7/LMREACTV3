import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { allLaneCount, getLaneCounts } from '../api/api';

function Dashboard() {
  const [accounts, setAccounts] = useState([]);
  const [counts, setCounts] = useState({ total: 0, valid: 0, invalid: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Run both requests in parallel
        const [accountsData, countsData] = await Promise.all([
          allLaneCount(),
          getLaneCounts()
        ]);

        setAccounts(accountsData || []);
        setCounts(countsData || { total: 0, valid: 0, invalid: 0 });

        if (!accountsData || accountsData.length === 0) {
          setError('No accounts data available');
        }
      } catch (err) {
        console.error('API Error:', err);
        setError('An error occurred while loading data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // State and data management only

  if (loading) {
    return <div className="text-center py-6 text-lg">Loading dashboard...</div>;
  }

  if (error) {
    return <>      <Header />
      <div className="text-center text-red-600 py-6">{error}</div></>;
  }

  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Title */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Lane Management Dashboard</h1>
            <p className="mt-2 text-gray-600">Real-time overview of your lane operations and metrics</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {/* Total Lanes Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center space-x-4">
              <div className="rounded-xl bg-blue-100 p-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Lanes</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">{counts.total ?? 0}</p>
              </div>
            </div>
            <div className="mt-4 h-1 w-full bg-blue-100 rounded-full overflow-hidden">
              <div className="h-1 bg-blue-600 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          {/* Active Lanes Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center space-x-4">
              <div className="rounded-xl bg-green-100 p-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Lanes</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">{counts.valid ?? 0}</p>
              </div>
            </div>
            <div className="mt-4 h-1 w-full bg-green-100 rounded-full overflow-hidden">
              <div className="h-1 bg-green-600 rounded-full" style={{ width: `${(counts.valid / counts.total * 100) || 0}%` }}></div>
            </div>
          </div>

          {/* Invalid Lanes Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center space-x-4">
              <div className="rounded-xl bg-red-100 p-3">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Invalid Lanes</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-600">{counts.invalid ?? 0}</p>
              </div>
            </div>
            <div className="mt-4 h-1 w-full bg-red-100 rounded-full overflow-hidden">
              <div className="h-1 bg-red-600 rounded-full" style={{ width: `${(counts.invalid / counts.total * 100) || 0}%` }}></div>
            </div>
          </div>
        </div>

        {/* Account Overview Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Account Overview</h2>
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl text-sm font-medium">
              {accounts.length} Active Accounts
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <div key={account.id}
                className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {account.accountName}
                    </h3>
                    <div className="text-sm text-gray-500">Account #{account.id}</div>
                  </div>
                  <div className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs font-semibold">
                    Active
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl p-3 text-center group-hover:bg-blue-50 transition-colors">
                    <div className="text-xs font-medium text-gray-500 mb-1">Total</div>
                    <div className="text-lg font-bold text-blue-600">{account.totalCount}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center group-hover:bg-green-50 transition-colors">
                    <div className="text-xs font-medium text-gray-500 mb-1">Active</div>
                    <div className="text-lg font-bold text-green-600">{account.validCount}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center group-hover:bg-red-50 transition-colors">
                    <div className="text-xs font-medium text-gray-500 mb-1">Invalid</div>
                    <div className="text-lg font-bold text-red-600">{account.invalidCount}</div>
                  </div>
                </div>

                {account.description && (
                  <p className="mt-4 text-sm text-gray-600 line-clamp-2">{account.description}</p>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Success Rate</span>
                    <span className="font-medium text-gray-900">
                      {((account.validCount / account.totalCount) * 100 || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-1.5 bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${(account.validCount / account.totalCount * 100) || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

export default Dashboard;
