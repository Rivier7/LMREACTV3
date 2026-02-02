import React from 'react';
import { useState, useEffect } from 'react';
import { Building2, ChevronDown } from 'lucide-react';
import { getLanes, getLanesByAccountId, deleteLaneById } from '../api/api.js';
import { useAccounts } from '../hooks/useAccountQueries.js';
import Lanes from '../components/Lanes.jsx';
import Header from '../components/Header.jsx';

function AllLanes() {
  const [lanes, setLanes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState('');

  const { data: accounts = [], isLoading: accountsLoading } = useAccounts();

  const handleDeleteLane = async id => {
    if (!window.confirm('Are you sure you want to delete this lane? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteLaneById(id);
      setLanes(current => current.filter(lane => lane.id !== id));
    } catch (error) {
      console.error('Error deleting lane:', error.message);
      alert(error.message);
    }
  };

  const handleAccountChange = e => {
    setSelectedAccountId(e.target.value);
  };

  useEffect(() => {
    const loadLanes = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedLanes = selectedAccountId
          ? await getLanesByAccountId(selectedAccountId)
          : await getLanes();
        setLanes(fetchedLanes || []);
      } catch (error) {
        setError('Error loading data');
        console.error('API Error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLanes();
  }, [selectedAccountId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading lanes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Lanes</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedAccount = accounts.find(a => a.id === Number(selectedAccountId));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <main className="p-6">
        <div className="max-w-[1600px] mx-auto">
          {/* Page Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Lanes</h1>
              <p className="text-gray-600 mt-1">
                Viewing {lanes.length} lane{lanes.length !== 1 ? 's' : ''}{' '}
                {selectedAccount ? `for ${selectedAccount.name}` : 'across all accounts'}
              </p>
            </div>

            {/* Account Filter Dropdown */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building2 className="w-4 h-4" />
                <span className="font-medium">Filter by Account:</span>
              </div>
              <div className="relative">
                <select
                  value={selectedAccountId}
                  onChange={handleAccountChange}
                  disabled={accountsLoading}
                  className={`appearance-none bg-white border rounded-lg px-4 py-2.5 pr-10 text-sm font-medium cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px] ${
                    selectedAccountId
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <option value="">All Accounts</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Lanes Component */}
          <Lanes lanes={lanes} onDelete={handleDeleteLane} />
        </div>
      </main>
    </div>
  );
}

export default AllLanes;
