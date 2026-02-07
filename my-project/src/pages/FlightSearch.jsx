import React, { useState } from 'react';
import { Search, ArrowRightLeft, Plane, Loader2 } from 'lucide-react';
import Header from '../components/Header';
import ErrorMessage from '../components/ErrorMessage';
import { searchFlights } from '../api/api';

function FlightSearch() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [flights, setFlights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async e => {
    e.preventDefault();
    const trimmedOrigin = origin.trim().toUpperCase();
    const trimmedDest = destination.trim().toUpperCase();
    if (!trimmedOrigin || !trimmedDest) return;

    setLoading(true);
    setError(null);
    setFlights(null);

    try {
      const results = await searchFlights(trimmedOrigin, trimmedDest);
      setFlights(results);
    } catch (err) {
      setError(err.message || 'Failed to search flights');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  // Day labels using unique abbreviations to distinguish all 7 days
  const DAY_LABELS = ['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su'];

  // Parse operatingDays into a Set for efficient lookup
  // Handles both comma-separated strings ("M,Tu,W") and arrays from JSON
  const parseOperatingDays = operatingDays => {
    if (!operatingDays) return new Set();
    if (Array.isArray(operatingDays)) return new Set(operatingDays);
    if (typeof operatingDays === 'string') {
      return new Set(operatingDays.split(',').map(d => d.trim()));
    }
    return new Set();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Flight Search</h1>
            <p className="text-gray-600 mt-1">Search for available flights between airports</p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-end gap-3 flex-wrap">
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Origin Airport</label>
                <input
                  type="text"
                  value={origin}
                  onChange={e => setOrigin(e.target.value.toUpperCase())}
                  placeholder="e.g. DFW"
                  maxLength={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium uppercase"
                />
              </div>

              <button
                type="button"
                onClick={handleSwap}
                className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Swap airports"
              >
                <ArrowRightLeft size={20} className="text-gray-500" />
              </button>

              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination Airport</label>
                <input
                  type="text"
                  value={destination}
                  onChange={e => setDestination(e.target.value.toUpperCase())}
                  placeholder="e.g. IAH"
                  maxLength={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium uppercase"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !origin.trim() || !destination.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Search size={18} />
                )}
                Search
              </button>
            </div>
          </form>

          {/* Error */}
          {error && (
            <div className="mb-6">
              <ErrorMessage
                message={error}
                title="Search Error"
                severity="error"
                onDismiss={() => setError(null)}
              />
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <Loader2 size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Searching for flights...</p>
              <p className="text-gray-400 text-sm mt-1">This may take a few seconds</p>
            </div>
          )}

          {/* Results */}
          {flights && !loading && (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Found <span className="font-semibold text-gray-900">{flights.length}</span> flight{flights.length !== 1 ? 's' : ''} from{' '}
                <span className="font-semibold">{origin.trim().toUpperCase()}</span> to{' '}
                <span className="font-semibold">{destination.trim().toUpperCase()}</span>
              </div>

              {flights.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                  <Plane size={40} className="text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No flights found</h3>
                  <p className="text-gray-600">No direct flights available for this route. Try different airport codes.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Flight</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Operator</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Route</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Departure</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Arrival</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Aircraft</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Operating Days</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flights.map((flight, idx) => (
                        <tr
                          key={`${flight.flightNumber}-${idx}`}
                          className={`border-b border-gray-100 last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                        >
                          <td className="px-4 py-3 font-semibold text-gray-900">
                            {flight.flightNumberIata || flight.flightNumber}
                          </td>
                          <td className="px-4 py-3 text-gray-700">{flight.operator || '-'}</td>
                          <td className="px-4 py-3 text-gray-700">
                            {flight.originCode} → {flight.destinationCode}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">{flight.departureTimeLocal}</td>
                          <td className="px-4 py-3 font-medium text-gray-900">{flight.arrivalTimeLocal}</td>
                          <td className="px-4 py-3 text-gray-700">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                              {flight.aircraftType || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              {(() => {
                                const operatingDaysSet = parseOperatingDays(flight.operatingDays);
                                return DAY_LABELS.map((dayLabel, dayIdx) => {
                                  const isActive = operatingDaysSet.has(dayLabel);
                                  return (
                                    <span
                                      key={dayIdx}
                                      className={`min-w-6 h-6 px-1 flex items-center justify-center rounded text-xs font-semibold ${
                                        isActive
                                          ? 'bg-blue-600 text-white'
                                          : 'bg-gray-100 text-gray-300'
                                      }`}
                                    >
                                      {dayLabel}
                                    </span>
                                  );
                                });
                              })()}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default FlightSearch;
