import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  XCircle,
  Clock,
  Lightbulb,
  MapPin,
  Plane,
  Filter,
  X,
  FileText,
} from 'lucide-react';
import {
  getLanesByLaneMappingId,
  updateLane,
  getLaneMappingById,
  validateFlight,
  updateLaneMappingLanes,
  getSuggestedRoute,
  getSuggestedRouteByLocation,
  getTAT,
  deleteLaneById,
} from '../api/api.js';

const LaneMappingLanes = () => {
  const { laneMappingId } = useParams();
  const [lanes, setLanes] = useState([]);
  const [laneMapping, setLaneMapping] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedLanes, setExpandedLanes] = useState({});
  const [filters, setFilters] = useState({});
  const [showColumnFilters, setShowColumnFilters] = useState(false);
  const [showSuggestedRoute, setShowSuggestedRoute] = useState(false);
  const [suggestError, setSuggestError] = useState(null);
  const [suggestedRoutes, setSuggestedRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(null);
  const [routeLaneId, setRouteLaneId] = useState(null);
  const [savedLaneId, setSavedLaneId] = useState(null);

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
    lastUpdate: 'Last Update',
  };

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
    'flightNumber',
    'originStation',
    'departureTime',
    'destinationStation',
    'arrivalTime',
    'flightOperatingDays',
    'aircraftByDay',
    'cutoffTime',
    'legValidationMessage',
  ];

  const legColumnLabels = {
    sequence: 'Seq',
    flightNumber: 'Flight #',
    originStation: 'Origin',
    departureTime: 'Departure',
    destinationStation: 'Destination',
    arrivalTime: 'Arrival',
    flightOperatingDays: 'Operating Days',
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
    const uniqueAircraft = [...new Set(entries.map(([, aircraft]) => aircraft))];
    if (uniqueAircraft.length === 1) return uniqueAircraft[0];
    return entries
      .map(([day, aircraft]) => `${dayAbbreviations[day] || day}: ${aircraft}`)
      .join(', ');
  };

  useEffect(() => {
    const fetchLanes = async () => {
      setLoading(true);
      try {
        const data = await getLanesByLaneMappingId(laneMappingId);
        if (!data || data.length === 0) setError('No lanes available for this lane mapping');
        else setLanes(data);
      } catch (error) {
        console.error(error);
        setError('Error loading lanes');
      } finally {
        setLoading(false);
      }
    };
    fetchLanes();
  }, [laneMappingId]);

  useEffect(() => {
    const fetchLaneMapping = async () => {
      try {
        const data = await getLaneMappingById(laneMappingId);
        setLaneMapping(data);
      } catch (error) {
        console.error(error);
        setError('Error loading lane mapping');
      }
    };
    fetchLaneMapping();
  }, [laneMappingId]);

  const hourColumns = [
    'driveToAirportDuration',
    'customClearance',
    'driveToDestination',
    'tatToConsigneeDuration',
  ];

  const formatHourValue = value => {
    let cleaned = value.replace(/[^\d]/g, '');
    if (cleaned) return cleaned + 'hr';
    return '';
  };

  const handleLaneChange = (laneId, field, value) => {
    const finalValue = hourColumns.includes(field) ? formatHourValue(value) : value;
    setLanes(current =>
      current.map(lane =>
        lane.id === laneId ? { ...lane, [field]: finalValue, hasBeenUpdated: true } : lane
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
          alert(`Origin '${newOrigin}' is already used as a departure airport in another leg.`);
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
          alert(`Destination '${newDestination}' was already used as a departure airport.`);
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
                id: Date.now(),
                sequence: (lane.legs?.length || 0) + 1,
                flightNumber: '',
                originStation: '',
                departureTime: '',
                destinationStation: '',
                arrivalTime: '',
                flightOperatingDays: '',
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
        await updateLaneMappingLanes(laneMappingId, updatedLanes);
      }
      const freshLanes = await getLanesByLaneMappingId(laneMappingId);
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
            console.log('Validation result:', result);
            console.log('Operating days from result:', result.operatingDays);
            const updatedLeg = {
              ...leg,
              valid: result.valid,
              message: result.message,
              validMessage: result.mismatchedFields || [],
              flightOperatingDays: result.operatingDays,
              aircraftByDay: result.aircraftByDay || null,
            };
            console.log('Updated leg with flightOperatingDays:', updatedLeg);
            return updatedLeg;
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
          lane.id === laneId ? { ...lane, legs: validatedLegs, valid: isLaneValid, hasBeenUpdated: true } : lane
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
        if (!lane.legs || lane.legs.length === 0) return { ...lane, valid: true };
        const validatedLegs = await Promise.all(
          lane.legs.map(async leg => {
            try {
              const result = await validateFlight(leg);
              return {
                ...leg,
                valid: result.valid,
                message: result.message,
                validMessage: result.mismatchedFields || [],
                flightOperatingDays: result.operatingDays,
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
        return { ...lane, legs: validatedLegs, valid: isLaneValid, hasBeenUpdated: true };
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

  // Count active column filters
  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value && key !== 'quickFilter'
  ).length;

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
        'originStation',
        'destinationStation',
      ];
      const matchesQuickFilter = searchableColumns.some(field =>
        lane[field]?.toString().toLowerCase().includes(searchValue)
      );
      if (!matchesQuickFilter) return false;
    }

    return Object.entries(filters).every(([field, value]) => {
      if (!value || field === 'quickFilter') return true;
      if (field === 'valid') {
        return lane.valid?.toString() === value;
      }
      return lane[field]?.toString().toLowerCase().includes(value.toLowerCase());
    });
  });

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
        flightOperatingDays: leg.flightOperatingDays,
        cutoffTime: leg.cutoffTime || '',
        aircraft: leg.aircraft || '',
        aircraftType: leg.aircraftType || '',
        valid: false,
        validMessage: [],
      }));

    setLanes(current =>
      current.map(l =>
        l.id === routeLaneId ? { ...l, legs: updated, hasBeenUpdated: true } : l
      )
    );

    setSuggestedRoutes([]);
    setShowSuggestedRoute(false);
    setSelectedRouteIndex(null);
    setRouteLaneId(null);
  };

  const handleSubmit = async id => {
    setLoading(true);
    try {
      const updatedLane = lanes.find(l => l.id === id);
      if (!updatedLane) return;

      console.log('Saving lane:', updatedLane);
      console.log('Saving legs:', updatedLane.legs);
      console.log('First leg flightOperatingDays:', updatedLane.legs?.[0]?.flightOperatingDays);

      await updateLane(updatedLane.id, updatedLane, updatedLane.legs || []);

      const freshLane = await getLanesByLaneMappingId(laneMappingId, id);
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

  const handleDeleteLane = async id => {
    if (!window.confirm('Are you sure you want to delete this lane? This action cannot be undone.')) {
      return;
    }
    setLoading(true);
    try {
      await deleteLaneById(id);
      setLanes(current => current.filter(lane => lane.id !== id));
    } catch (error) {
      console.error('Error deleting lane:', error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && lanes.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-lg">Loading lanes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-5 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{laneMapping?.name || 'Lane Mapping'} Lanes</h1>
            <p className="text-blue-100 text-sm mt-1">
              {filteredLanes.length} lane{filteredLanes.length !== 1 ? 's' : ''} displayed
              {lanes.length > 0 && lanes.length !== filteredLanes.length && ` of ${lanes.length} total`}
            </p>
          </div>
          <button
            onClick={handleSaveChanges}
            disabled={loading || !lanes.some(l => l.hasBeenUpdated)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Save size={18} />
            Save All Changes
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && !loading && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-red-700">
            <XCircle size={18} />
            {error}
          </div>
        </div>
      )}

      {/* Suggest Error Display */}
      {suggestError && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 text-yellow-800">
              <Lightbulb size={18} />
              <div>
                <p className="font-semibold">Route Suggestion Error</p>
                <p className="text-sm">{suggestError}</p>
              </div>
            </div>
            <button
              onClick={() => setSuggestError(null)}
              className="text-yellow-700 hover:text-yellow-900 p-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Search lanes..."
              value={filters.quickFilter || ''}
              onChange={e => setFilters({ ...filters, quickFilter: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
            <select
              value={filters.valid || ''}
              onChange={e => setFilters(prev => ({ ...prev, valid: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Status</option>
              <option value="true">Valid</option>
              <option value="false">Invalid</option>
            </select>
            <button
              onClick={() => setShowColumnFilters(!showColumnFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${showColumnFilters || activeFilterCount > 0
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
            >
              <Filter size={16} />
              Column Filters
              {activeFilterCount > 0 && (
                <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
              onClick={validateAllLanes}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              Validate All
            </button>
            {(filters.quickFilter || activeFilterCount > 0) && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center gap-1"
              >
                <X size={14} />
                Clear
              </button>
            )}
          </div>

          {/* Collapsible Column Filters */}
          {showColumnFilters && (
            <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {['originCity', 'originState', 'originCountry', 'destinationCity', 'destinationState', 'destinationCountry', 'itemNumber', 'laneOption'].map(col => (
                <div key={col}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    {columnLabels[col]}
                  </label>
                  <select
                    value={filters[col] || ''}
                    onChange={e => setFilters(prev => ({ ...prev, [col]: e.target.value }))}
                    className={`w-full px-3 py-1.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${filters[col] ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                      }`}
                  >
                    <option value="">All</option>
                    {getUniqueValues(col).map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lanes List */}
      <div className="flex-1 px-6 py-4">
        <div className="max-w-7xl mx-auto space-y-3">
          {filteredLanes.map(lane => (
            <div
              key={lane.id}
              className={`bg-white rounded-xl border shadow-sm transition-all ${lane.hasBeenUpdated ? 'border-amber-300 ring-1 ring-amber-200' : 'border-gray-200'
                } ${expandedLanes[lane.id] ? 'shadow-md' : 'hover:shadow-md'}`}
            >
              {/* Summary Row */}
              <div
                className="px-4 py-3 flex items-center gap-4 cursor-pointer"
                onClick={() => toggleLaneExpansion(lane.id)}
              >
                {/* Expand Toggle */}
                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                  {expandedLanes[lane.id] ? (
                    <ChevronDown size={20} className="text-gray-500" />
                  ) : (
                    <ChevronRight size={20} className="text-gray-500" />
                  )}
                </button>

                {/* Route Display */}
                <div className="flex items-center gap-3 min-w-[280px]">
                  <div className="text-center">
                    <div className="font-bold text-gray-900">{lane.originStation || '---'}</div>
                    <div className="text-xs text-gray-500">{lane.originCity}</div>
                  </div>
                  <div className="flex items-center px-2">
                    <div className="w-6 h-px bg-gray-300"></div>
                    <Plane size={16} className="text-blue-500 mx-1" />
                    <div className="w-6 h-px bg-gray-300"></div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900">{lane.destinationStation || '---'}</div>
                    <div className="text-xs text-gray-500">{lane.destinationCity}</div>
                  </div>
                </div>

                {/* Info Pills */}
                <div className="flex items-center gap-2 flex-1">
                  <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                    Item: {lane.itemNumber || '-'}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                    Opt: {lane.laneOption || '-'}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                    Pickup: {lane.pickUpTime || '-'}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
                    TAT: {lane.tatToConsigneeDuration || '-'}
                  </span>
                  {lane.legs?.length > 0 && (
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                      {lane.legs.length} leg{lane.legs.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  {lane.hasBeenUpdated && (
                    <span className="px-2 py-1 rounded bg-amber-100 text-amber-700 text-xs font-medium">
                      Unsaved
                    </span>
                  )}
                  {savedLaneId === lane.id && (
                    <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-medium animate-pulse">
                      Saved!
                    </span>
                  )}
                  {lane.valid ? (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                      <CheckCircle size={14} />
                      Valid
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                      <XCircle size={14} />
                      Invalid
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => validateLegs(lane.id)}
                    disabled={loading}
                    className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600 disabled:opacity-50"
                    title="Validate Legs"
                  >
                    <CheckCircle size={16} />
                  </button>
                  <button
                    onClick={() => computeTATForLane(lane.id)}
                    disabled={loading}
                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600 disabled:opacity-50"
                    title="Calculate TAT"
                  >
                    <Clock size={16} />
                  </button>
                  <button
                    onClick={() => handleSuggestRoute(lane.id)}
                    disabled={loading}
                    className="p-2 hover:bg-purple-100 rounded-lg transition-colors text-purple-600 disabled:opacity-50"
                    title="Suggest Route (Airport)"
                  >
                    <Lightbulb size={16} />
                  </button>
                  <button
                    onClick={() => handleSuggestRouteByLocation(lane.id)}
                    disabled={loading}
                    className="p-2 hover:bg-teal-100 rounded-lg transition-colors text-teal-600 disabled:opacity-50"
                    title="Suggest Route (Location)"
                  >
                    <MapPin size={16} />
                  </button>
                  <button
                    onClick={() => handleSubmit(lane.id)}
                    disabled={!lane.hasBeenUpdated || loading}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${lane.hasBeenUpdated
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    title="Save this lane"
                  >
                    <Save size={14} />
                    Save
                  </button>
                  <button
                    onClick={() => handleDeleteLane(lane.id)}
                    disabled={loading}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 disabled:opacity-50"
                    title="Delete Lane"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Expanded Detail Panel */}
              {expandedLanes[lane.id] && (
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-5">
                  {/* Location Details */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <MapPin size={16} className="text-gray-500" />
                      Location Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg border border-gray-200 p-3">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Origin</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">City</label>
                            <input
                              type="text"
                              value={lane.originCity || ''}
                              onChange={e => handleLaneChange(lane.id, 'originCity', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">State</label>
                            <input
                              type="text"
                              value={lane.originState || ''}
                              onChange={e => handleLaneChange(lane.id, 'originState', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Country</label>
                            <input
                              type="text"
                              value={lane.originCountry || ''}
                              onChange={e => handleLaneChange(lane.id, 'originCountry', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-200 p-3">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Destination</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">City</label>
                            <input
                              type="text"
                              value={lane.destinationCity || ''}
                              onChange={e => handleLaneChange(lane.id, 'destinationCity', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">State</label>
                            <input
                              type="text"
                              value={lane.destinationState || ''}
                              onChange={e => handleLaneChange(lane.id, 'destinationState', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Country</label>
                            <input
                              type="text"
                              value={lane.destinationCountry || ''}
                              onChange={e => handleLaneChange(lane.id, 'destinationCountry', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pre-Route Details */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Clock size={16} className="text-gray-500" />
                      Pre-Route Details
                    </h3>
                    <div className="bg-white rounded-lg border border-gray-200 p-3">
                      <div className="grid grid-cols-5 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Item Number</label>
                          <input
                            type="text"
                            value={lane.itemNumber || ''}
                            onChange={e => handleLaneChange(lane.id, 'itemNumber', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Lane Option</label>
                          <select
                            value={lane.laneOption || ''}
                            onChange={e => handleLaneChange(lane.id, 'laneOption', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Option</option>
                            <option value="Primary">Primary</option>
                            <option value="Secondary">Secondary</option>
                            <option value="Alternative">Alternative</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Pick Up Time</label>
                          <input
                            type="text"
                            value={lane.pickUpTime || ''}
                            onChange={e => handleLaneChange(lane.id, 'pickUpTime', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Drive to Airport</label>
                          <input
                            type="text"
                            value={lane.driveToAirportDuration || ''}
                            onChange={e => handleLaneChange(lane.id, 'driveToAirportDuration', e.target.value)}
                            placeholder="e.g. 3hr"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Service Level</label>
                          <input
                            type="text"
                            value={lane.serviceLevel || ''}
                            onChange={e => handleLaneChange(lane.id, 'serviceLevel', e.target.value)}
                            placeholder="e.g. NFO, DIRECT DRIVE"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Flight Legs */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Plane size={16} className="text-gray-500" />
                        Flight Legs
                      </span>
                      <button
                        onClick={() => handleAddLeg(lane.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition"
                      >
                        <Plus size={14} />
                        Add Leg
                      </button>
                    </h3>
                    {lane.legs && lane.legs.length > 0 ? (
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                              {legColumns.map(col => (
                                <th
                                  key={col}
                                  className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600"
                                >
                                  {legColumnLabels[col]}
                                </th>
                              ))}
                              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 w-16">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {lane.legs.map((leg, legIdx) => (
                              <tr
                                key={leg.id || legIdx}
                                className={`border-b border-gray-100 last:border-0 ${legIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                  }`}
                              >
                                {legColumns.map(col => (
                                  <td key={col} className="px-3 py-2">
                                    {col === 'sequence' ? (
                                      <input
                                        type="number"
                                        value={leg[col] || ''}
                                        onChange={e => handleLegChange(lane.id, leg.id, col, e.target.value)}
                                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                      />
                                    ) : col === 'legValidationMessage' ? (
                                      leg.valid === false && leg.validMessage?.length > 0 ? (
                                        <div className="text-red-600 text-xs max-w-[150px] truncate" title={leg.validMessage.join('; ')}>
                                          {leg.validMessage.join('; ')}
                                        </div>
                                      ) : leg.valid === true ? (
                                        <CheckCircle size={16} className="text-green-500" />
                                      ) : (
                                        <span className="text-gray-400 text-xs">Pending</span>
                                      )
                                    ) : col === 'aircraftByDay' ? (
                                      <div
                                        className="text-xs text-gray-700 max-w-[100px] truncate"
                                        title={
                                          leg.aircraftByDay
                                            ? Object.entries(leg.aircraftByDay)
                                              .map(([day, aircraft]) => `${day}: ${aircraft}`)
                                              .join('\n')
                                            : ''
                                        }
                                      >
                                        {formatAircraftByDay(leg.aircraftByDay)}
                                      </div>
                                    ) : (
                                      <input
                                        type="text"
                                        value={leg[col] || ''}
                                        onChange={e => handleLegChange(lane.id, leg.id, col, e.target.value)}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                      />
                                    )}
                                  </td>
                                ))}
                                <td className="px-3 py-2">
                                  <button
                                    onClick={() => handleRemoveLeg(lane.id, leg.id)}
                                    className="p-1.5 hover:bg-red-100 text-red-600 rounded transition"
                                    title="Remove leg"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                        <Plane size={32} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No flight legs defined</p>
                        <button
                          onClick={() => handleAddLeg(lane.id)}
                          className="mt-3 text-blue-600 text-sm font-medium hover:text-blue-700"
                        >
                          Add your first leg
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Post-Route Details */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Clock size={16} className="text-gray-500" />
                      Post-Route Details
                    </h3>
                    <div className="bg-white rounded-lg border border-gray-200 p-3">
                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Custom Clearance</label>
                          <input
                            type="text"
                            value={lane.customClearance || ''}
                            onChange={e => handleLaneChange(lane.id, 'customClearance', e.target.value)}
                            placeholder="e.g. 3hr"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Drive to Destination</label>
                          <input
                            type="text"
                            value={lane.driveToDestination || ''}
                            onChange={e => handleLaneChange(lane.id, 'driveToDestination', e.target.value)}
                            placeholder="e.g. 3hr"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Delivery Time</label>
                          <input
                            type="text"
                            value={lane.actualDeliveryTimeBasedOnReceiving || ''}
                            onChange={e => handleLaneChange(lane.id, 'actualDeliveryTimeBasedOnReceiving', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">TAT Duration</label>
                          <input
                            type="text"
                            value={lane.tatToConsigneeDuration || ''}
                            onChange={e => handleLaneChange(lane.id, 'tatToConsigneeDuration', e.target.value)}
                            placeholder="e.g. 3hr"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FileText size={16} className="text-gray-500" />
                      Additional Notes
                    </h3>
                    <textarea
                      value={lane.additionalNotes || ''}
                      onChange={e => handleLaneChange(lane.id, 'additionalNotes', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                      placeholder="Enter any additional notes here..."
                    />
                  </div>

                  {/* Suggested Routes */}
                  {showSuggestedRoute && suggestedRoutes.length > 0 && routeLaneId === lane.id && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Lightbulb size={16} className="text-purple-500" />
                          Suggested Routes
                        </span>
                        <button
                          onClick={() => {
                            setShowSuggestedRoute(false);
                            setSuggestedRoutes([]);
                            setSelectedRouteIndex(null);
                            setRouteLaneId(null);
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X size={18} />
                        </button>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {suggestedRoutes.map((routePattern, routeIndex) => (
                          <div
                            key={routeIndex}
                            className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${selectedRouteIndex === routeIndex
                              ? 'border-green-500 bg-green-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                              }`}
                            onClick={() => setSelectedRouteIndex(routeIndex)}
                          >
                            <div className="mb-3">
                              <p className="text-sm font-bold text-gray-800">Option {routeIndex + 1}</p>
                              <p className="text-xs text-gray-600 mt-1">
                                {routePattern.originStation} → {routePattern.destinationStation}
                              </p>
                            </div>

                            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                              {routePattern.legs
                                .sort((a, b) => a.sequence - b.sequence)
                                .map((leg, i) => (
                                  <div
                                    key={i}
                                    className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs"
                                  >
                                    <p className="font-semibold text-gray-700">
                                      Leg {leg.sequence}: {leg.flightNumber}
                                    </p>
                                    <p className="text-gray-600">
                                      {leg.originStation} → {leg.destinationStation}
                                    </p>
                                    <p className="text-gray-500">
                                      {leg.departureTime} - {leg.arrivalTime}
                                    </p>
                                  </div>
                                ))}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (selectedRouteIndex === routeIndex) {
                                  applyRoute(routePattern);
                                } else {
                                  setSelectedRouteIndex(routeIndex);
                                }
                              }}
                              className={`w-full px-4 py-2 rounded-lg text-sm font-semibold transition ${selectedRouteIndex === routeIndex
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                              {selectedRouteIndex === routeIndex ? 'Apply This Route' : 'Select'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {suggestError && routeLaneId === lane.id && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                      <strong>Error:</strong> {suggestError}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {filteredLanes.length === 0 && !loading && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Plane size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No lanes found</h3>
              <p className="text-gray-500 text-sm">
                {filters.quickFilter || activeFilterCount > 0
                  ? 'Try adjusting your filters to see more results.'
                  : 'This lane mapping has no lanes configured.'}
              </p>
              {(filters.quickFilter || activeFilterCount > 0) && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LaneMappingLanes;
