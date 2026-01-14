import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { ChevronDown, ChevronRight, Plus, Trash2, Save } from 'lucide-react';
import {
  getLaneByAccountId,
  updateLane,
  getAccountbyId,
  validateFlight,
  updateAccountLanes,
  getSuggestedRoute,
  getSuggestedRouteByLocation,
  getTAT,
} from '../api/api.js';

const AccountLanes = () => {
  const { accountId } = useParams();
  const [lanes, setLanes] = useState([]);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedLanes, setExpandedLanes] = useState({});
  const [filters, setFilters] = useState({});
  const [selectedCell, setSelectedCell] = useState(null);
  const [showSuggestedRoute, setShowSuggestedRoute] = useState(false);
  const [suggestError, setSuggestError] = useState(null);
  const [suggestedRoutes, setSuggestedRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(null);
  const [routeLaneId, setRouteLaneId] = useState(null);
  const [savedLaneId, setSavedLaneId] = useState(null);

  const columns = [
    'originCity',
    'originState',
    'originCountry',
    'destinationCity',
    'destinationState',
    'destinationCountry',
    'itemNumber',
    'laneOption',
    'pickUpTime',
    'driveToAirportDuration',
    'originStation',
    'destinationStation',
    'customClearance',
    'driveToDestination',
    'actualDeliveryTimeBasedOnReceiving',
    'tatToConsigneeDuration',
    'additionalNotes',
    'lastUpdate',
  ];

  const handleSuggestRoute = async laneId => {
    try {
      setSuggestError(null);

      const lane = lanes.find(l => l.id === laneId);
      if (!lane || !lane.legs || lane.legs.length === 0) {
        setSuggestError('Lane has no legs to suggest a route for.');
        return;
      }

      const payload = {
        itemNumber: lane.itemNumber,
        originAirport: lane.legs[0]?.originStation,
        destinationAirport: lane.legs[lane.legs.length - 1]?.destinationStation,
        collectionTime: lane.pickUpTime,
      };

      if (!payload.originAirport || !payload.destinationAirport) {
        setSuggestError('Origin and destination airports must be set in the legs.');
        return;
      }

      const results = await getSuggestedRoute(payload);
      setSuggestedRoutes(results);
      setRouteLaneId(laneId);
      setSelectedRouteIndex(null);
      setShowSuggestedRoute(true);
    } catch (error) {
      let message = 'Failed to suggest route.';
      if (error.message) message = error.message;
      else if (error.response?.data?.error) message = error.response.data.error;

      setSuggestedRoutes([]);
      setSuggestError(message);
    }
  };

  const handleSuggestRouteByLocation = async laneId => {
    try {
      setSuggestError(null);

      const lane = lanes.find(l => l.id === laneId);
      if (!lane) {
        setSuggestError('Lane not found.');
        return;
      }

      const payload = {
        itemNumber: lane.itemNumber,
        originCity: lane.originCity,
        originState: lane.originState,
        originCountry: lane.originCountry,
        destinationCity: lane.destinationCity,
        destinationState: lane.destinationState,
        destinationCountry: lane.destinationCountry,
        collectionTime: lane.pickUpTime,
      };

      const results = await getSuggestedRouteByLocation(payload);
      setSuggestedRoutes(results);
      setRouteLaneId(laneId);
      setSelectedRouteIndex(null);
      setShowSuggestedRoute(true);
    } catch (error) {
      let message = 'Failed to suggest route by location.';
      if (error.message) message = error.message;
      else if (error.response?.data?.error) message = error.response.data.error;

      setSuggestedRoutes([]);
      setSuggestError(message);
    }
  };

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
    additionalNotes: 'Notes',
  };

  const readOnlyColumns = ['originStation', 'destinationStation', 'lastUpdate'];

  const getUniqueValues = field => {
    const values = lanes
      .map(l => {
        const v = l ? l[field] : undefined;
        if (v === null || v === undefined) return null;
        return typeof v === 'string' ? v : String(v);
      })
      .filter(v => v !== null && v !== undefined && v !== '');
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  };

  const legColumns = [
    'sequence',
    'serviceLevel',
    'flightNumber',
    'originStation',
    'departureTime',
    'destinationStation',
    'arrivalTime',
    'flightOperatingdays',
    'aircraftByDay',
    'cutoffTime',
    'legValidationMessage',
  ];

  const legColumnLabels = {
    sequence: 'Seq',
    serviceLevel: 'Service Level',
    flightNumber: 'Flight #',
    originStation: 'Origin',
    departureTime: 'Departure',
    destinationStation: 'Destination',
    arrivalTime: 'Arrival',
    flightOperatingdays: 'Operating Days',
    aircraftByDay: 'Aircraft by Day',
    cutoffTime: 'Cutoff',
    legValidationMessage: 'Leg Status',
  };

  const dayAbbreviations = {
    MONDAY: 'Mon',
    TUESDAY: 'Tue',
    WEDNESDAY: 'Wed',
    THURSDAY: 'Thu',
    FRIDAY: 'Fri',
    SATURDAY: 'Sat',
    SUNDAY: 'Sun',
  };

  const formatAircraftByDay = aircraftByDay => {
    if (!aircraftByDay || typeof aircraftByDay !== 'object') return '-';

    const entries = Object.entries(aircraftByDay);
    if (entries.length === 0) return '-';

    // Check if all aircraft are the same
    const uniqueAircraft = [...new Set(entries.map(([, aircraft]) => aircraft))];
    if (uniqueAircraft.length === 1) {
      return uniqueAircraft[0];
    }

    // Show abbreviated day: aircraft pairs
    return entries
      .map(([day, aircraft]) => `${dayAbbreviations[day] || day}: ${aircraft}`)
      .join(', ');
  };

  useEffect(() => {
    const fetchLanes = async () => {
      setLoading(true);
      try {
        const data = await getLaneByAccountId(accountId);
        if (!data || data.length === 0) setError('No lanes available for this account');
        else setLanes(data);
      } catch (error) {
        console.error(error);
        setError('Error loading lanes');
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
        setError('Error loading account');
      }
    };
    fetchAccount();
  }, [accountId]);

  const handleLaneChange = (laneId, field, value) => {
    setLanes(current =>
      current.map(lane =>
        lane.id === laneId ? { ...lane, [field]: value, hasBeenUpdated: true } : lane
      )
    );
  };

  const handleLegChange = (laneId, legId, field, value) => {
    if (field === 'originStation') {
      const newOrigin = value.toUpperCase();
      const lane = lanes.find(l => l.id === laneId);

      if (lane && lane.legs) {
        const otherLegsOrigins = lane.legs
          .filter(leg => leg.id !== legId)
          .map(leg => leg.originStation?.toUpperCase())
          .filter(Boolean);

        if (otherLegsOrigins.includes(newOrigin)) {
          alert(
            `Origin '${newOrigin}' is already used as a departure airport in another leg. Each leg must have a unique origin.`
          );
          return;
        }
      }
    }

    if (field === 'destinationStation') {
      const lane = lanes.find(l => l.id === laneId);
      const leg = lane?.legs?.find(l => l.id === legId);
      const origin = leg?.originStation?.toUpperCase();
      const newDestination = value.toUpperCase();

      if (origin && newDestination === origin) {
        alert('Origin and destination cannot be the same.');
        return;
      }

      if (lane && lane.legs) {
        const allOrigins = lane.legs.map(l => l.originStation?.toUpperCase()).filter(Boolean);

        if (allOrigins.includes(newDestination)) {
          alert(
            `Destination '${newDestination}' was already used as a departure airport. Cannot reuse departure airports as arrival airports.`
          );
          return;
        }
      }
    }

    setLanes(current =>
      current.map(lane =>
        lane.id === laneId
          ? {
            ...lane,
            legs: lane.legs.map(leg => (leg.id === legId ? { ...leg, [field]: value } : leg)),
            hasBeenUpdated: true,
            originStation: lane.legs[0]?.originStation || '',
            destinationStation: lane.legs[lane.legs.length - 1]?.destinationStation || '',
          }
          : lane
      )
    );
  };

  const handleAddLeg = laneId => {
    setLanes(current =>
      current.map(lane =>
        lane.id === laneId
          ? {
            ...lane,
            hasBeenUpdated: true,
            legs: [
              ...(lane.legs || []),
              {
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
                valid: false,
              },
            ],
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
            legs: lane.legs.filter(leg => leg.id !== legId),
            originStation: lane.legs.filter(leg => leg.id !== legId)[0]?.originStation || '',
            destinationStation:
              lane.legs.filter(leg => leg.id !== legId)[
                lane.legs.filter(leg => leg.id !== legId).length - 1
              ]?.destinationStation || '',
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
      setError('Error saving changes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const validateLegs = async laneId => {
    setLoading(true);
    try {
      const laneToValidate = lanes.find(l => l.id === laneId);
      if (!laneToValidate || !laneToValidate.legs) return;

      const validatedLegs = await Promise.all(
        laneToValidate.legs.map(async leg => {
          try {
            const result = await validateFlight(leg);
            return {
              ...leg,
              valid: result.valid,
              message: result.message,
              validMessage: result.mismatchedFields || [],
              flightOperatingdays: result.operatingDays,
              aircraftByDay: result.aircraftByDay || null,
            };
          } catch (error) {
            return {
              ...leg,
              valid: false,
              validMessage: [error.message || 'Validation failed'],
            };
          }
        })
      );

      const isLaneValid = validatedLegs.every(leg => leg.valid);

      setLanes(current =>
        current.map(lane =>
          lane.id === laneId ? { ...lane, legs: validatedLegs, valid: isLaneValid } : lane
        )
      );
    } catch (err) {
      setError('Error validating flight legs.');
      console.error('Validation Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const computeTATForLane = async laneId => {
    setLoading(true);
    try {
      const laneToCalculate = lanes.find(l => l.id === laneId);
      if (!laneToCalculate) return;

      const tatTime = await getTAT(laneToCalculate, laneToCalculate.legs || []);

      setLanes(current =>
        current.map(lane =>
          lane.id === laneId ? { ...lane, tatToConsigneeDuration: tatTime } : lane
        )
      );
    } catch (error) {
      setError('Error calculating TAT.');
      console.error('TAT Calculation Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateAllLanes = async () => {
    setLoading(true);
    try {
      const validatedLanesPromises = lanes.map(async lane => {
        if (!lane.legs || lane.legs.length === 0) {
          return { ...lane, valid: true };
        }
        const validatedLegs = await Promise.all(
          lane.legs.map(async leg => {
            try {
              const result = await validateFlight(leg);
              return {
                ...leg,
                valid: result.valid,
                message: result.message,
                validMessage: result.mismatchedFields || [],
                flightOperatingdays: result.operatingDays,
                aircraftByDay: result.aircraftByDay || null,
              };
            } catch (error) {
              return {
                ...leg,
                valid: false,
                validMessage: [error.message || 'Validation failed'],
              };
            }
          })
        );
        const isLaneValid = validatedLegs.every(leg => leg.valid);
        return { ...lane, legs: validatedLegs, valid: isLaneValid };
      });
      const newLanes = await Promise.all(validatedLanesPromises);
      setLanes(newLanes);
    } catch (err) {
      setError('Error validating all flight legs.');
      console.error('Bulk Validation Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleLaneExpansion = laneId => {
    setExpandedLanes(prev => ({ ...prev, [laneId]: !prev[laneId] }));
  };

  const filteredLanes = lanes.filter(lane => {
    if (filters.quickFilter) {
      const searchValue = filters.quickFilter.toLowerCase();
      const searchableColumns = [
        'originCity',
        'originState',
        'originCountry',
        'destinationCity',
        'destinationState',
        'destinationCountry',
        'itemNumber',
        'laneOption',
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

  const applyRoute = routePattern => {
    if (!routeLaneId) return;

    const updated = routePattern.legs
      .sort((a, b) => a.sequence - b.sequence)
      .map(leg => ({
        id: leg.id || Date.now() + Math.random(),
        sequence: leg.sequence,
        flightNumber: leg.flightNumber,
        originStation: leg.originStation,
        destinationStation: leg.destinationStation,
        departureTime: leg.departureTime,
        arrivalTime: leg.arrivalTime,
        flightOperatingdays: leg.flightOperatingdays,
        serviceLevel: leg.serviceLevel || '',
        cutoffTime: leg.cutoffTime || '',
        aircraft: leg.aircraft || '',
        aircraftType: leg.aircraftType || '',
        valid: false,
        validMessage: [],
      }));

    setLanes(current =>
      current.map(l =>
        l.id === routeLaneId
          ? {
            ...l,
            legs: updated,
            hasBeenUpdated: true,
          }
          : l
      )
    );

    setSuggestedRoutes([]);
    setShowSuggestedRoute(false);
    setSelectedRouteIndex(null);
    setRouteLaneId(null);
  };

  if (loading && lanes.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600 text-lg">Loading lanes…</p>
      </div>
    );
  }

  const handleSubmit = async id => {
    setLoading(true);
    try {
      const updatedLane = lanes.find(l => l.id === id);
      if (!updatedLane) return;

      await updateLane(updatedLane.id, updatedLane, updatedLane.legs || []);

      const freshLane = await getLaneByAccountId(accountId, id);
      if (freshLane && freshLane.length > 0) {
        setLanes(current =>
          current.map(l => (l.id === id ? { ...freshLane[0], hasBeenUpdated: false } : l))
        );
      }

      setSavedLaneId(id);
      setTimeout(() => setSavedLaneId(null), 3000);
    } catch (error) {
      console.error('Error updating lane:', error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-white">
      <Header />
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Account {account?.name}</h1>
            <p className="text-blue-100 text-sm mt-1">
              {filteredLanes.length} lane(s) displayed{' '}
              {lanes.length > 0 && lanes.length !== filteredLanes.length && `of ${lanes.length}`}
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
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 text-red-700">{error}</div>
      )}

      {suggestError && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3 text-yellow-800 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="flex-shrink-0 mt-0.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <p className="font-semibold">Route Suggestion Error</p>
              <p className="text-sm mt-1">{suggestError}</p>
            </div>
          </div>
          <button
            onClick={() => setSuggestError(null)}
            className="text-yellow-700 hover:text-yellow-900 flex-shrink-0 text-lg font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <div className="bg-gray-100 px-6 py-3 border-b border-gray-300 flex gap-3 overflow-x-auto ">
        <input
          type="text"
          placeholder="Quick filter across all fields..."
          value={filters.quickFilter || ''}
          onChange={e => setFilters({ ...filters, quickFilter: e.target.value })}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filters.sheet || ''}
          onChange={e => setFilters({ ...filters, sheet: e.target.value })}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Sheets</option>
          {getUniqueValues('sheet').map(v => (
            <option key={v} value={v}>
              {v}
            </option>
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

      <div className="flex-1 overflow-x-scroll overflow-y-auto p-2 scroll-container">
        <div className="inline-block min-w-full">
          <table className="w-full border-collapse bg-white">
            <thead className="bg-gray-200 border-b-2 border-gray-400">
              <tr>
                <th className="w-8 px-2 py-2 text-center border-r border-gray-300 bg-gray-200"></th>
                {columns.map(col => (
                  <th
                    key={col}
                    className="px-3 py-2 border-r border-gray-300 bg-gray-200 font-bold text-xs text-gray-700 whitespace-nowrap text-left"
                    style={{ minWidth: '120px' }}
                  >
                    {columnLabels[col]}{' '}
                    {readOnlyColumns.includes(col) && (
                      <span className="text-gray-500 text-xs">(auto)</span>
                    )}
                  </th>
                ))}
                <th className="px-3 py-2 border-r border-gray-300 bg-gray-200 font-bold text-xs text-gray-700 whitespace-nowrap">
                  Status
                </th>
                <th className="px-3 py-2 bg-gray-200 font-bold text-xs text-gray-700 whitespace-nowrap">
                  Actions
                </th>
              </tr>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 border-r border-gray-300"></th>
                {columns.map(col => (
                  <th key={`filter-${col}`} className="px-2 py-1 border-r border-gray-300">
                    <select
                      value={filters[col] || ''}
                      onChange={e => setFilters(prev => ({ ...prev, [col]: e.target.value }))}
                      className="w-full px-2 py-1 text-xs border rounded bg-white"
                    >
                      <option value="">All</option>
                      {getUniqueValues(col).map(v => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </th>
                ))}
                <th className="px-2 py-1 border-r border-gray-300">
                  <select
                    value={filters['valid'] || ''}
                    onChange={e => setFilters(prev => ({ ...prev, valid: e.target.value }))}
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
                    <td
                      className="w-8 px-2 py-2 text-center border-r border-gray-300 bg-gray-50 cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleLaneExpansion(lane.id)}
                    >
                      {lane.legs?.length > 0 &&
                        (expandedLanes[lane.id] ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        ))}
                    </td>
                    {columns.map(col => (
                      <td
                        key={col}
                        className="px-3 py-1 border-r border-gray-300"
                        onClick={() =>
                          !readOnlyColumns.includes(col) &&
                          setSelectedCell({ laneId: lane.id, field: col })
                        }
                      >
                        <input
                          type="text"
                          value={lane[col] || ''}
                          onChange={e => handleLaneChange(lane.id, col, e.target.value)}
                          onKeyDown={e => handleKeyDown(e, lane.id, col)}
                          disabled={readOnlyColumns.includes(col)}
                          className={`w-full px-2 py-1 text-sm border ${selectedCell?.laneId === lane.id && selectedCell?.field === col ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${readOnlyColumns.includes(col) ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                          style={{ minWidth: '100px' }}
                        />
                      </td>
                    ))}
                    <td className="px-3 py-2 border-r border-gray-300 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${lane.valid ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}
                      >
                        {lane.valid ? '✓ Valid' : '✗ Invalid'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => toggleLaneExpansion(lane.id)}
                          className="p-1.5 hover:bg-gray-200 rounded transition"
                          title="Toggle details"
                        >
                          {expandedLanes[lane.id] ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </button>
                        <button
                          className="p-1.5 hover:bg-green-100 rounded transition text-green-600"
                          title="Validate legs"
                          onClick={() => validateLegs(lane.id)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </button>
                        <button
                          className="p-1.5 hover:bg-blue-100 rounded transition text-blue-600"
                          title="Calculate TAT (turnaround) for this lane"
                          onClick={() => computeTATForLane(lane.id)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                          </svg>
                        </button>
                        <button
                          className="p-1.5 hover:bg-purple-100 rounded transition text-purple-600"
                          title="Suggest route by airport codes"
                          onClick={() => handleSuggestRoute(lane.id)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
                            <path d="M9 18h6"></path>
                            <path d="M10 22h4"></path>
                          </svg>
                        </button>
                        <button
                          className="p-1.5 hover:bg-green-100 rounded transition text-green-600"
                          title="Suggest route by city/state/country"
                          onClick={() => handleSuggestRouteByLocation(lane.id)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleSubmit(lane.id)}
                          disabled={!lane.hasBeenUpdated || loading}
                          className="p-1.5 hover:bg-blue-100 rounded transition text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Save this lane"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                          </svg>
                        </button>
                        {savedLaneId === lane.id && (
                          <span className="text-xs text-green-600 font-semibold ml-2">Saved!</span>
                        )}
                      </div>
                    </td>
                  </tr>

                  {expandedLanes[lane.id] && lane.legs && (
                    <tr className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td
                        colSpan={columns.length + 3}
                        className="px-4 py-3 border-t-2 border-blue-300"
                      >
                        <div className="bg-blue-50 rounded border border-blue-200 overflow-auto">
                          <table className="w-full">
                            <thead className="sticky top-0 z-40 bg-blue-100 border-b border-blue-300">
                              <tr>
                                {legColumns.map(col => (
                                  <th
                                    key={col}
                                    className="px-3 py-2 text-left text-xs font-semibold text-blue-900 border-r border-blue-200"
                                  >
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
                                <tr
                                  key={leg.id}
                                  className={legIdx % 2 === 0 ? 'bg-white' : 'bg-blue-50'}
                                >
                                  {legColumns.map(col => (
                                    <td key={col} className="px-3 py-2 border-r border-blue-200">
                                      {col === 'sequence' ? (
                                        <input
                                          type="number"
                                          value={leg[col]}
                                          onChange={e =>
                                            handleLegChange(lane.id, leg.id, col, e.target.value)
                                          }
                                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        />
                                      ) : col === 'legValidationMessage' ? (
                                        leg.valid === false &&
                                          leg.validMessage &&
                                          leg.validMessage.length > 0 ? (
                                          <div className="text-red-600 text-xs">
                                            {leg.validMessage.join('; ')}
                                          </div>
                                        ) : leg.valid === true ? (
                                          <div className="text-green-600 text-xs">Valid</div>
                                        ) : (
                                          <div className="text-gray-500 text-xs">Pending</div>
                                        )
                                      ) : col === 'aircraftByDay' ? (
                                        <div className="text-xs text-gray-700" title={
                                          leg.aircraftByDay
                                            ? Object.entries(leg.aircraftByDay)
                                              .map(([day, aircraft]) => `${day}: ${aircraft}`)
                                              .join('\n')
                                            : ''
                                        }>
                                          {formatAircraftByDay(leg.aircraftByDay)}
                                        </div>
                                      ) : (
                                        <input
                                          type="text"
                                          value={leg[col] || ''}
                                          onChange={e =>
                                            handleLegChange(lane.id, leg.id, col, e.target.value)
                                          }
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

                            {/* SUGGESTED ROUTES (TOP 3) */}
                            {showSuggestedRoute &&
                              suggestedRoutes.length > 0 &&
                              routeLaneId === lane.id && (
                                <tbody>
                                  <tr>
                                    <td
                                      colSpan={legColumns.length + 1}
                                      className="px-4 py-4 border-t-2 border-blue-300"
                                    >
                                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-4">
                                          <h3 className="text-sm font-bold text-gray-800">
                                            Suggested Route Patterns (Top 3)
                                          </h3>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setShowSuggestedRoute(false);
                                              setSuggestedRoutes([]);
                                              setSelectedRouteIndex(null);
                                              setRouteLaneId(null);
                                            }}
                                            className="text-gray-500 hover:text-gray-700 text-lg font-bold"
                                          >
                                            ✕
                                          </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                          {suggestedRoutes.map((routePattern, routeIndex) => (
                                            <div
                                              key={routeIndex}
                                              className={`border-2 rounded-lg p-3 transition-all cursor-pointer ${selectedRouteIndex === routeIndex
                                                ? 'border-green-500 bg-green-50 shadow-md'
                                                : 'border-blue-300 bg-white hover:border-blue-500'
                                                }`}
                                            >
                                              <div className="mb-3">
                                                <p className="text-xs font-bold text-blue-900 mb-1">
                                                  Option {routeIndex + 1}
                                                </p>
                                                <p className="text-xs text-blue-700 font-semibold">
                                                  {routePattern.originStation} →{' '}
                                                  {routePattern.destinationStation}
                                                </p>
                                              </div>

                                              <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                                                {routePattern.legs
                                                  .sort((a, b) => a.sequence - b.sequence)
                                                  .map((leg, i) => (
                                                    <div
                                                      key={i}
                                                      className="bg-gray-50 border border-gray-200 rounded p-1.5 text-xs"
                                                    >
                                                      <p className="font-semibold text-gray-700">
                                                        Leg {leg.sequence}: {leg.flightNumber}
                                                      </p>
                                                      <p className="text-gray-600">
                                                        {leg.originStation} →{' '}
                                                        {leg.destinationStation}
                                                      </p>
                                                      <p className="text-gray-500 text-xs">
                                                        {leg.departureTime} - {leg.arrivalTime}
                                                      </p>
                                                      <p className="text-gray-500 text-xs">
                                                        Days: {leg.flightOperatingdays}
                                                      </p>
                                                    </div>
                                                  ))}
                                              </div>

                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (selectedRouteIndex === routeIndex) {
                                                    applyRoute(routePattern);
                                                  } else {
                                                    setSelectedRouteIndex(routeIndex);
                                                  }
                                                }}
                                                className={`w-full px-3 py-2 rounded text-xs font-semibold transition-colors ${selectedRouteIndex === routeIndex
                                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                                                  }`}
                                              >
                                                {selectedRouteIndex === routeIndex
                                                  ? '✓ Apply This Route'
                                                  : 'Select'}
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              )}

                            {suggestError && routeLaneId === lane.id && (
                              <tbody>
                                <tr>
                                  <td
                                    colSpan={legColumns.length + 1}
                                    className="px-4 py-4 border-t border-red-300"
                                  >
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                      <strong>Error:</strong> {suggestError}
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            )}
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
    </div>
  );
};

export default AccountLanes;
