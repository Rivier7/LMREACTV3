import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { allLaneCount, getLaneCounts } from '../api/api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

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

  const barData = {
    labels: ['Total Lanes', 'Valid Lanes', 'Invalid Lanes'],
    datasets: [
      {
        label: 'Lane Counts',
        data: [counts.total, counts.valid, counts.invalid],
        backgroundColor: ['#3b82f6', '#22c55e', '#ef4444'], // blue, green, red
        borderColor: ['#1e3a8a', '#15803d', '#b91c1c'],
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

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

      <main className="max-w-7xl mx-auto p-8">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">Lane Management Dashboard</h1>
          <p className="text-gray-500 mt-2">Overview of lanes and accounts — quick stats and trends</p>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Lanes</p>
              <p className="text-3xl font-bold text-gray-900">{counts.total ?? 0}</p>
            </div>
            <div className="rounded-full bg-blue-50 text-blue-600 p-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="6" fill="currentColor" /></svg>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Lanes</p>
              <p className="text-3xl font-bold text-green-600">{counts.valid ?? 0}</p>
            </div>
            <div className="rounded-full bg-green-50 text-green-600 p-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="currentColor" /></svg>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Invalid Lanes</p>
              <p className="text-3xl font-bold text-red-600">{counts.invalid ?? 0}</p>
            </div>
            <div className="rounded-full bg-red-50 text-red-600 p-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </div>
        </div>

        {/* Chart card */}
        <div className="bg-white p-6 rounded-2xl shadow mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Lane Distribution</h2>
            <p className="text-sm text-gray-500">Last 30 days</p>
          </div>
          <div className="w-full">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {/* Account Overview Section */}
        <section>
          <h2 className="text-xl font-bold mb-6 text-gray-900">Account Overview</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <div key={account.id} className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition duration-300">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">{account.accountName}</h3>
                  <div className="text-sm text-gray-500">ID {account.id}</div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-sm text-gray-500">Total</div>
                    <div className="text-lg font-bold text-blue-600">{account.totalCount}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-sm text-gray-500">Active</div>
                    <div className="text-lg font-bold text-green-600">{account.validCount}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-sm text-gray-500">Invalid</div>
                    <div className="text-lg font-bold text-red-600">{account.invalidCount}</div>
                  </div>
                </div>

                {account.description && (
                  <p className="mt-4 text-sm text-gray-500">{account.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

export default Dashboard;
