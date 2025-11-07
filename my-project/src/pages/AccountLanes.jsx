import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getLaneByAccountId, updateLane, getAccountbyId } from '../api/api.js';
import Header from '../components/Header';
import { ChevronDown, ChevronRight, Plus, Trash2, Save } from 'lucide-react';
import { validateFlight, updateAccountLanes, getTAT } from '../api/api.js';

const AccountLanes = () => {
  const { accountId } = useParams();
  const [lanes, setLanes] = useState([]);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedLanes, setExpandedLanes] = useState({});
  const [filters, setFilters] = useState({});
  const [selectedCell, setSelectedCell] = useState(null);

  const columns = [
    'originCity', 'originState', 'originCountry',
    'destinationCity', 'destinationState', 'destinationCountry', 'itemNumber',
    'laneOption', 'pickUpTime', 'driveToAirportDuration', 'originStation',
    'destinationStation', 'customClearance', 'driveToDestination',
    'actualDeliveryTimeBasedOnReceiving', 'tatToConsigneeDuration', 'additionalNotes'
  ];

  const columnLabels = {
    originCity: 'Origin City',
    originState: 'Origin State',
    originCountry: 'Origin Country',
    destinationCity: 'Destination City',
    destinationState: 'Destination State',
    destinationCountry: 'Destination Country',
    itemNumber: 'Item Number',
    laneOption: 'Lane Option',
    pickUpTime: 'Pick Up Time',
    driveToAirportDuration: 'Drive to Airport',
    originStation: 'Origin Station',
    destinationStation: 'Destination Station',
    customClearance: 'Custom Clearance',
    driveToDestination: 'Drive to Destination',
    actualDeliveryTimeBasedOnReceiving: 'Delivery Time',
    tatToConsigneeDuration: 'TAT Duration',
    additionalNotes: 'Notes'
  };

  // ✅ Columns that are read-only (auto-updated from legs)
  const readOnlyColumns = ['originStation', 'destinationStation'];

  const getUniqueValues = (field) => {
    const values = lanes.map(l => {
      const v = l ? l[field] : undefined;
      if (v === null || v === undefined) return null;
      return typeof v === 'string' ? v : String(v);
    }).filter(v => v !== null && v !== undefined && v !== '');
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  };

  const legColumns = ['sequence', 'serviceLevel', 'flightNumber', 'originStation', 'departureTime', 'destinationStation', 'arrivalTime', 'flightOperatingdays', 'aircraft', 'aircraftType', 'cutoffTime'];

  const legColumnLabels = {
    sequence: 'Seq',
    serviceLevel: 'Service Level',
    flightNumber: 'Flight #',
    originStation: 'Origin',
    departureTime: 'Departure',
    destinationStation: 'Destination',
    arrivalTime: 'Arrival',
    flightOperatingdays: 'Operating Days',
    aircraft: 'Aircraft',
    aircraftType: 'Aircraft Type',
    cutoffTime: 'Cutoff'
  };

  useEffect(() => {
    const fetchLanes = async () => {
      setLoading(true);
      try {
        const data = await getLaneByAccountId(accountId);
        if (!data || data.length === 0) setError("No lanes available for this account");
        else setLanes(data);
      } catch (error) {
        console.error(error);
        setError("Error loading lanes");
      } finally {
        setLoading(false);
      }
    };
    fetchLanes();
  }, [accountId]);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const data = await getAccountbyId(accountId);
        setAccount(data);
      } catch (error) {
        console.error(error);
        setError("Error loading account");
      }
    };
    fetchAccount();
  }, [accountId]);

  const handleLaneChange = (laneId, field, value) => {
    setLanes(current =>
      current.map(lane =>
        lane.id === laneId ? { ...lane, [field]: value, hasBeenUpdated: true, lastUpdate: new Date().toISOString() } : lane
      )
    );
  };

  const handleLegChange = (laneId, legId, field, value) => {
    // ✅ Prevent duplicate origins across legs in the same lane
    if (field === 'originStation') {
      const newOrigin = value.toUpperCase();
      const lane = lanes.find(l => l.id === laneId);

      if (lane && lane.legs) {
        const otherLegsOrigins = lane.legs
          .filter(leg => leg.id !== legId)
          .map(leg => leg.originStation?.toUpperCase())
          .filter(Boolean);

        if (otherLegsOrigins.includes(newOrigin)) {
          alert(`Origin '${newOrigin}' is already used as a departure airport in another leg. Each leg must have a unique origin.`);
          return;
        }
      }
    }

    // ✅ Prevent same origin and destination in same leg
    if (field === 'destinationStation') {
      const lane = lanes.find(l => l.id === laneId);
      const leg = lane?.legs?.find(l => l.id === legId);
      const origin = leg?.originStation?.toUpperCase();
      const newDestination = value.toUpperCase();

      if (origin && newDestination === origin) {
        alert("Origin and destination cannot be the same.");
        return;
      }

      if (lane && lane.legs) {
        const allOrigins = lane.legs
          .map(l => l.originStation?.toUpperCase())
          .filter(Boolean);

        if (allOrigins.includes(newDestination)) {
          alert(`Destination '${newDestination}' was already used as a departure airport. Cannot reuse departure airports as arrival airports.`);
          return;
        }
      }
    }

    // ✅ Update the leg and auto-update lane origin/destination
    setLanes(current =>
      current.map(lane =>
        lane.id === laneId
          ? {
            ...lane,
            hasBeenUpdated: true,
            lastUpdate: new Date().toISOString(),
            legs: lane.legs.map(leg =>
              leg.id === legId ? { ...leg, [field]: value } : leg
            ),
            // ✅ Auto-update lane origin and destination from legs
            originStation: lane.legs[0]?.originStation || '',
            destinationStation: lane.legs[lane.legs.length - 1]?.destinationStation || ''
          }
          : lane
      )
    );
  };

  const handleAddLeg = (laneId) => {
    setLanes(current =>
      current.map(lane =>
        lane.id === laneId
          ? {
            ...lane,
            hasBeenUpdated: true,
            lastUpdate: new Date().toISOString(),
            legs: [
              ...(lane.legs || []),
              {
                id: Date.now(),
                sequence: (lane.legs?.length || 0) + 1,
                serviceLevel: '',
                flightNumber: '',
                originStation: '',
                departureTime: '',
                destinationStation: '',
                arrivalTime: '',
                flightOperatingdays: '',
                aircraft: '',
                aircraftType: '',
                cutoffTime: '',
                valid: false
              }
            ]
          }
          : lane
      )
    );
  };

  const handleRemoveLeg = (laneId, legId) => {
    setLanes(current =>
      current.map(lane =>
        lane.id === laneId
          ? {
            ...lane,
            hasBeenUpdated: true,
            lastUpdate: new Date().toISOString(),
            legs: lane.legs.filter(leg => leg.id !== legId),
            originStation: lane.legs.filter(leg => leg.id !== legId)[0]?.originStation || '',
            destinationStation: lane.legs.filter(leg => leg.id !== legId)[lane.legs.filter(leg => leg.id !== legId).length - 1]?.destinationStation || ''
          }
          : lane
      )
    );
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const updatedLanes = lanes.filter(lane => lane.hasBeenUpdated);
      if (updatedLanes.length > 0) {
        await updateAccountLanes(accountId, updatedLanes);
      }
      const freshLanes = await getLaneByAccountId(accountId);
      setLanes(freshLanes);
    } catch (error) {
      setError("Error saving changes");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const validateLegs = async (laneId) => {
    setLoading(true);
    try {
      const laneToValidate = lanes.find(l => l.id === laneId);
      if (!laneToValidate || !laneToValidate.legs) return;

      const validatedLegs = await Promise.all(
        laneToValidate.legs.map(async (leg) => {
          const result = await validateFlight(leg);
          return {
            ...leg,
            valid: result.valid,
            message: result.message,
            validMessage: result.mismatchedFields,
            flightOperatingdays: result.operatingDays,
          };
        })
      );

      const isLaneValid = validatedLegs.every(leg => leg.valid);

      setLanes(current =>
        current.map(lane =>
          lane.id === laneId
            ? { ...lane, legs: validatedLegs, valid: isLaneValid, hasBeenUpdated: true, lastUpdate: new Date().toISOString() }
            : lane
        )
      );
    } catch (err) {
      setError("Error validating flight legs.");
      console.error("Validation Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const computeTATForLane = async (laneId) => {
    setLoading(true);
    try {
      const laneToCalculate = lanes.find(l => l.id === laneId);
      if (!laneToCalculate) return;

      const tatTime = await getTAT(laneToCalculate, laneToCalculate.legs || []);

      setLanes(current =>
        current.map(lane =>
          lane.id === laneId
            ? { ...lane, tatToConsigneeDuration: tatTime, hasBeenUpdated: true, lastUpdate: new Date().toISOString() }
            : lane
        )
      );
    } catch (error) {
      setError("Error calculating TAT.");
      console.error("TAT Calculation Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateAllLanes = async () => {
    setLoading(true);
    try {
      const validatedLanesPromises = lanes.map(async (lane) => {
        if (!lane.legs || lane.legs.length === 0) {
          return { ...lane, valid: true };
        }
        const validatedLegs = await Promise.all(
          lane.legs.map(async (leg) => {
            const result = await validateFlight(leg);
            return {
              ...leg,
              valid: result.valid,
              message: result.message,
              validMessage: result.mismatchedFields,
              flightOperatingdays: result.operatingDays,
            };
          })
        );
        const isLaneValid = validatedLegs.every(leg => leg.valid);
        return { ...lane, legs: validatedLegs, valid: isLaneValid, hasBeenUpdated: true, lastUpdate: new Date().toISOString() };
      });
      const newLanes = await Promise.all(validatedLanesPromises);
      setLanes(newLanes);
    } catch (err) {
      setError("Error validating all flight legs.");
      console.error("Bulk Validation Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleLaneExpansion = (laneId) => {
    setExpandedLanes(prev => ({ ...prev, [laneId]: !prev[laneId] }));
  };

  const filteredLanes = lanes.filter(lane => {
    if (filters.quickFilter) {
      const searchValue = filters.quickFilter.toLowerCase();
      const searchableColumns = [
        'originCity', 'originState', 'originCountry',
        'destinationCity', 'destinationState', 'destinationCountry', 'itemNumber', 'laneOption'
      ];
      const matchesQuickFilter = searchableColumns.some(field =>
        lane[field]?.toString().toLowerCase().includes(searchValue)
      );
      if (!matchesQuickFilter) return false;
    }

    return Object.entries(filters).every(([field, value]) => {
      if (!value || field === 'quickFilter') return true;
      return lane[field]?.toString().toLowerCase().includes(value.toLowerCase());
    });
  });

  const handleKeyDown = (e, laneId, field) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const currentIndex = columns.indexOf(field);
      const nextField = e.shiftKey ? columns[currentIndex - 1] : columns[currentIndex + 1];
      if (nextField) setSelectedCell({ laneId, field: nextField });
    }
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  if (loading && lanes.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600 text-lg">Loading lanes…</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-white">
      <Header />
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Account {account?.name}</h1>
            <p className="text-blue-100 text-sm mt-1">
              {filteredLanes.length} lane(s) displayed {lanes.length > 0 && lanes.length !== filteredLanes.length && `of ${lanes.length}`}
            </p>
          </div>
          <button
            onClick={handleSaveChanges}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition disabled:opacity-50"
          >
            <Save size={18} /> Save Changes
          </button>
        </div>
      </div>

      {error && !loading && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="bg-gray-100 px-6 py-3 border-b border-gray-300 flex gap-3 overflow-x-auto">
        <input
          type="text"
          placeholder="Quick filter across all fields..."
          value={filters.quickFilter || ''}
          onChange={(e) => setFilters({ ...filters, quickFilter: e.target.value })}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filters.sheet || ''}
          onChange={(e) => setFilters({ ...filters, sheet: e.target.value })}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Sheets</option>
          {getUniqueValues('sheet').map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
        <button
          onClick={handleClearFilters}
          className="px-3 py-1.5 bg-gray-300 hover:bg-gray-400 rounded text-sm font-medium transition"
        >
          Clear Filters
        </button>
        <button
          onClick={validateAllLanes}
          className="px-3 py-1.5 bg-blue-500 text-white hover:bg-blue-600 rounded text-sm font-medium transition"
        >
          Validate All Flights
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="inline-block min-w-full">
          <table className="w-full border-collapse bg-white">
            <thead className="sticky top-0 z-20 bg-gray-200 border-b-2 border-gray-400">
              <tr>
                <th className="w-8 px-2 py-2 text-center border-r border-gray-300 bg-gray-200"></th>
                {columns.map(col => (
                  <th
                    key={col}
                    className="px-3 py-2 border-r border-gray-300 bg-gray-200 font-bold text-xs text-gray-700 whitespace-nowrap text-left"
                    style={{ minWidth: '120px' }}
                  >
                    {columnLabels[col]} {readOnlyColumns.includes(col) && <span className="text-gray-500 text-xs">(auto)</span>}
                  </th>
                ))}
                <th className="px-3 py-2 border-r border-gray-300 bg-gray-200 font-bold text-xs text-gray-700 whitespace-nowrap">Status</th>
                <th className="px-3 py-2 bg-gray-200 font-bold text-xs text-gray-700 whitespace-nowrap">Actions</th>
              </tr>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 border-r border-gray-300"></th>
                {columns.map(col => (
                  <th key={`filter-${col}`} className="px-2 py-1 border-r border-gray-300">
                    <select
                      value={filters[col] || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, [col]: e.target.value }))}
                      className="w-full px-2 py-1 text-xs border rounded bg-white"
                    >
                      <option value="">All</option>
                      {getUniqueValues(col).map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </th>
                ))}
                <th className="px-2 py-1 border-r border-gray-300">
                  <select
                    value={filters['valid'] || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, valid: e.target.value }))}
                    className="w-full px-2 py-1 text-xs border rounded-md bg-white shadow-sm focus:ring-1 focus:ring-blue-300"
                  >
                    <option value="">All</option>
                    <option value="true">Valid</option>
                    <option value="false">Invalid</option>
                  </select>
                </th>
                <th className="px-2 py-1">
                  <button
                    onClick={handleClearFilters}
                    className="w-full px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                    title="Clear column filters"
                  >
                    Clear
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLanes.map((lane, idx) => (
                <React.Fragment key={lane.id}>
                  <tr className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="w-8 px-2 py-2 text-center border-r border-gray-300 bg-gray-50 cursor-pointer hover:bg-gray-100" onClick={() => toggleLaneExpansion(lane.id)}>
                      {lane.legs?.length > 0 && (expandedLanes[lane.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                    </td>
                    {columns.map(col => (
                      <td key={col} className="px-3 py-1 border-r border-gray-300" onClick={() => !readOnlyColumns.includes(col) && setSelectedCell({ laneId: lane.id, field: col })}>
                        <input
                          type="text"
                          value={lane[col] || ''}
                          onChange={(e) => handleLaneChange(lane.id, col, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, lane.id, col)}
                          disabled={readOnlyColumns.includes(col)}
                          className={`w-full px-2 py-1 text-sm border ${selectedCell?.laneId === lane.id && selectedCell?.field === col ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${readOnlyColumns.includes(col) ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                          style={{ minWidth: '100px' }}
                        />
                      </td>
                    ))}
                    <td className="px-3 py-2 border-r border-gray-300 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${lane.valid ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                        {lane.valid ? '✓ Valid' : '✗ Invalid'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => toggleLaneExpansion(lane.id)} className="p-1.5 hover:bg-gray-200 rounded transition" title="Toggle details">
                          {expandedLanes[lane.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                        <button
                          className="p-1.5 hover:bg-green-100 rounded transition text-green-600"
                          title="Validate legs"
                          onClick={() => validateLegs(lane.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </button>
                        <button
                          className="p-1.5 hover:bg-blue-100 rounded transition text-blue-600"
                          title="Calculate TAT (turnaround) for this lane"
                          onClick={() => computeTATForLane(lane.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                          </svg>
                        </button>
                        <button
                          className="p-1.5 hover:bg-purple-100 rounded transition text-purple-600"
                          title="Get AI suggestions for optimal flight legs"
                          onClick={() => alert('AI leg suggestions coming soon!')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
                            <path d="M9 18h6"></path>
                            <path d="M10 22h4"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expandedLanes[lane.id] && lane.legs && (
                    <tr className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td colSpan={columns.length + 3} className="px-4 py-3 border-t-2 border-blue-300">
                        <div className="bg-blue-50 rounded border border-blue-200 overflow-auto">
                          <table className="w-full">
                            <thead className="bg-blue-100 border-b border-blue-300">
                              <tr>
                                {legColumns.map(col => (
                                  <th key={col} className="px-3 py-2 text-left text-xs font-semibold text-blue-900 border-r border-blue-200">
                                    {legColumnLabels[col]}
                                  </th>
                                ))}
                                <th className="px-3 py-2 text-left text-xs font-semibold text-blue-900">
                                  Actions
                                  <button
                                    onClick={() => handleAddLeg(lane.id)}
                                    className="ml-3 inline-flex items-center p-1 hover:bg-blue-100 rounded transition text-blue-600"
                                    title="Add leg"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {lane.legs.map((leg, legIdx) => (
                                <tr key={leg.id} className={legIdx % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                                  {legColumns.map(col => (
                                    <td key={col} className="px-3 py-2 border-r border-blue-200">
                                      {col === 'sequence' ? (
                                        <input
                                          type="number"
                                          value={leg[col]}
                                          onChange={(e) => handleLegChange(lane.id, leg.id, col, e.target.value)}
                                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        />
                                      ) : (
                                        <input
                                          type="text"
                                          value={leg[col] || ''}
                                          onChange={(e) => handleLegChange(lane.id, leg.id, col, e.target.value)}
                                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        />
                                      )}
                                    </td>
                                  ))}
                                  <td className="px-3 py-2">
                                    <button
                                      onClick={() => handleRemoveLeg(lane.id, leg.id)}
                                      className="p-1 hover:bg-red-100 text-red-600 rounded transition"
                                      title="Remove leg"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-100 border-t border-gray-300 px-6 py-2 text-xs text-gray-600">
        Total Lanes: {filteredLanes.length} {lanes.length > 0 && lanes.length !== filteredLanes.length && `of ${lanes.length}`} | Ready to save
      </div>
    </div>
  );
};

export default AccountLanes;