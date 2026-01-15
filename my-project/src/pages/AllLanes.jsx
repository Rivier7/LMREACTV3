import React from 'react';
import { useState, useEffect } from 'react';
import { getLanes } from '../api/api.js';
import Lanes from '../components/Lanes.jsx';
import Header from '../components/Header.jsx';

function AllLanes() {
  const [lanes, setLanes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLanes = async () => {
      try {
        const lanes = await getLanes();
        if (!lanes || lanes.length === 0) {
          setError('No data available');
        } else {
          setLanes(lanes);
        }
      } catch (error) {
        setError('Error loading data');
        console.error('API Error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLanes();
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <main className="p-6">
        <div className="max-w-[1600px] mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">All Lanes</h1>
            <p className="text-gray-600 mt-1">
              Viewing {lanes.length} lane{lanes.length !== 1 ? 's' : ''} across all accounts
            </p>
          </div>

          {/* Lanes Component */}
          <Lanes lanes={lanes} />
        </div>
      </main>
    </div>
  );
}

export default AllLanes;
