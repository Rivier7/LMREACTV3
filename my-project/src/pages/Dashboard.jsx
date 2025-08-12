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
      <div className="p-8">
        {/* Dashboard Title */}
        <h1 className="text-4xl font-bold text-center mb-10">Lane Management Dashboard</h1>

        {/* Total Counts Section with Bar Chart */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-4">Lane Distribution </h2>
          <div className="max-w-xs mx-auto">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {/* Account Overview Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          <h2 className="col-span-full text-xl font-bold mb-6 text-center">Account Overview</h2>
          {accounts.map((account) => (
            <div
              key={account.id}
              className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition duration-300"
            >
              <h3 className="text-2xl font-semibold text-gray-800 border-b pb-3 mb-4">
                {account.accountName}
              </h3>
              <div className="space-y-3">
                <p className="text-lg">
                  <span className="font-medium text-gray-600">Total Lanes:</span>{' '}
                  <span className="text-blue-600 font-semibold">{account.totalCount}</span>
                </p>
                <p className="text-lg">
                  <span className="font-medium text-gray-600">Active Lanes:</span>{' '}
                  <span className="text-green-600 font-semibold">{account.validCount}</span>
                </p>
                <p className="text-lg">
                  <span className="font-medium text-gray-600">Invalid Lanes:</span>{' '}
                  <span className="text-red-600 font-semibold">{account.invalidCount}</span>
                </p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}

export default Dashboard;
