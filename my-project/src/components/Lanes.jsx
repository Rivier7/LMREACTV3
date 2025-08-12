import React, { useState, useEffect } from 'react';
import Lane from './Lane';
function Lanes({ lanes }) {
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
    valid: '', // ✅ Added
  });

  const [filteredLanes, setFilteredLanes] = useState(lanes);

  useEffect(() => {
    const result = lanes.filter((lane) => {
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
        (filters.valid === '' || lane.valid === (filters.valid === 'true')) // ✅ Filter by valid
      );
    });
    setFilteredLanes(result);
  }, [filters, lanes]);

  const handleFilterChange = (e) => {
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
      valid: '', // ✅ Reset valid
    });
  };

  const fields = [
    { label: 'Account', name: 'accountName' },
    { label: 'Origin Country', name: 'originCountry' },
    { label: 'Origin State', name: 'originState' },
    { label: 'Origin City', name: 'originCity' },
    { label: 'Origin Airport', name: 'originStation' },
    { label: 'Destination Country', name: 'destinationCountry' },
    { label: 'Destination State', name: 'destinationState' },
    { label: 'Destination City', name: 'destinationCity' },
    { label: 'Destination Airport', name: 'destinationStation' },
    { label: 'ITEM#', name: 'itemNumber' },
    { label: 'OPTION#', name: 'laneOption' },
    { label: 'Valid Status', name: 'valid' }, // ✅ Added field
  ];

  return (
    <div className="text-center">
      {/* Filters */}
      <div className="inline-block">
        <form className="min-w-[1300px]">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-13 gap-6 items-end">
              {fields.map((field) => {
                const tempFilters = { ...filters };
                delete tempFilters[field.name];

                const tempFiltered = lanes.filter((lane) => {
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
                    : [...new Set(tempFiltered.map((lane) => lane[field.name]))];

                return (
                  <div
                    className="flex flex-col space-y-2 w-[120px]"
                    key={field.name}
                  >
                    <label className="text-gray-700 text-xs font-medium leading-tight">
                      {field.label}
                    </label>
                    <select
                      name={field.name}
                      value={filters[field.name]}
                      onChange={handleFilterChange}
                      className="w-full text-xs border border-gray-300 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors"
                    >
                      <option value="" className="text-gray-500">All</option>
                      {options.map((val) => (
                        <option key={val} value={val} className="text-gray-900">
                          {field.name === 'valid'
                            ? val === 'true'
                              ? 'Valid'
                              : 'Invalid'
                            : val}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}

              {/* Clear Filters Button */}
              <div className="flex justify-center items-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="bg-white text-blue-600 border border-blue-600 rounded-md px-4 py-1.5 text-xs font-medium hover:bg-blue-50 hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 whitespace-nowrap"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Lane Grid */}
      <div className="flex flex-col gap-4 bg-white border border-gray-300 p-4 min-w-[1200px] mt-4">
        {filteredLanes.map((lane, idx) => (
          <Lane key={lane.id + '-' + idx} lane={lane} />
        ))}
      </div>
    </div>
  );
}

export default Lanes;
