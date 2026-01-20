import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import Lane from './Lane';

function Lanes({ lanes, onDelete }) {
  const [filters, setFilters] = useState({
    accountName: '',
    originCountry: '',
    originState: '',
    originStation: '',
    originCity: '',
    destinationCountry: '',
    destinationState: '',
    destinationCity: '',
    itemNumber: '',
    destinationStation: '',
    valid: '',
  });

  const [filteredLanes, setFilteredLanes] = useState(lanes);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    const result = lanes.filter(lane => {
      return (
        (!filters.accountName || lane.accountName === filters.accountName) &&
        (!filters.originCountry || lane.originCountry === filters.originCountry) &&
        (!filters.originState || lane.originState === filters.originState) &&
        (!filters.originStation || lane.originStation === filters.originStation) &&
        (!filters.destinationStation || lane.destinationStation === filters.destinationStation) &&
        (!filters.originCity || lane.originCity === filters.originCity) &&
        (!filters.destinationCountry || lane.destinationCountry === filters.destinationCountry) &&
        (!filters.destinationState || lane.destinationState === filters.destinationState) &&
        (!filters.destinationCity || lane.destinationCity === filters.destinationCity) &&
        (!filters.itemNumber || lane.itemNumber === filters.itemNumber) &&
        (!filters.laneOption || lane.laneOption === filters.laneOption) &&
        (filters.valid === '' || lane.valid === (filters.valid === 'true'))
      );
    });
    setFilteredLanes(result);
  }, [filters, lanes]);

  const handleFilterChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({
      accountName: '',
      originCountry: '',
      originState: '',
      originStation: '',
      originCity: '',
      destinationCountry: '',
      destinationState: '',
      destinationCity: '',
      itemNumber: '',
      destinationStation: '',
      laneOption: '',
      valid: '',
    });
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  const fields = [
    { label: 'Account', name: 'accountName', icon: '🏢' },
    { label: 'Origin Country', name: 'originCountry', icon: '🌍' },
    { label: 'Origin State', name: 'originState', icon: '📍' },
    { label: 'Origin City', name: 'originCity', icon: '🏙️' },
    { label: 'Origin Airport', name: 'originStation', icon: '✈️' },
    { label: 'Dest. Country', name: 'destinationCountry', icon: '🌍' },
    { label: 'Dest. State', name: 'destinationState', icon: '📍' },
    { label: 'Dest. City', name: 'destinationCity', icon: '🏙️' },
    { label: 'Dest. Airport', name: 'destinationStation', icon: '✈️' },
    { label: 'Item #', name: 'itemNumber', icon: '#️⃣' },
    { label: 'Option #', name: 'laneOption', icon: '🔢' },
    { label: 'Status', name: 'valid', icon: '✓' },
  ];

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filter Toggle Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
              <p className="text-sm text-gray-600">
                {filteredLanes.length} of {lanes.length} lanes
                {activeFilterCount > 0 && (
                  <span className="ml-2 text-blue-600">({activeFilterCount} active)</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>

        {/* Filter Fields */}
        {showFilters && (
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {fields.map(field => {
                const tempFilters = { ...filters };
                delete tempFilters[field.name];

                const tempFiltered = lanes.filter(lane => {
                  return Object.entries(tempFilters).every(([key, val]) => {
                    if (key === 'valid') {
                      return !val || lane.valid === (val === 'true');
                    }
                    return !val || lane[key] === val;
                  });
                });

                const options =
                  field.name === 'valid'
                    ? ['true', 'false']
                    : [...new Set(tempFiltered.map(lane => lane[field.name]).filter(Boolean))];

                const hasValue = filters[field.name] !== '';

                return (
                  <div className="flex flex-col" key={field.name}>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      {field.label}
                    </label>
                    <div className="relative">
                      <select
                        name={field.name}
                        value={filters[field.name]}
                        onChange={handleFilterChange}
                        className={`w-full text-sm border rounded-lg px-3 py-2.5 bg-white appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          hasValue
                            ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        <option value="" className="text-gray-500">
                          All
                        </option>
                        {options.map(val => (
                          <option key={val} value={val} className="text-gray-900">
                            {field.name === 'valid' ? (val === 'true' ? 'Valid' : 'Invalid') : val}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {filteredLanes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No lanes found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filters to find what you're looking for.</p>
          <button
            onClick={clearFilters}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLanes.map((lane, idx) => (
            <Lane key={lane.id + '-' + idx} lane={lane} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Lanes;
