import React, { useState, useEffect } from 'react';
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
  Pencil,
  Calendar,
  User,
  AlertTriangle,
  RefreshCw,
  Search,
  Truck,
  PackageCheck,
} from 'lucide-react';
import EditLaneMappingModal from '../components/EditLaneMappingModal';
import CreateLaneModal from '../components/CreateLaneModal';
import {
  getLanesByLaneMappingId,
  getLaneMappingById,
updateLaneMappingLanes,
  getSuggestedRoute,
  getSuggestedRouteByLocation,
  getTAT,
  calculateAllTAT,
  deleteLaneById,
  validateLaneMappingWithProgress,
  validateAndSaveLane,
  syncLaneSchedule,
  getCachedFlights,
  getViableFlights,
  applySuggestedTimes,
} from '../api/api.js';

const LaneMappingLanes = () => {
  const { laneMappingId } = useParams();
  const [lanes, setLanes] = useState([]);
  const [laneMapping, setLaneMapping] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedLanes, setExpandedLanes] = useState({});
  const [expandedNotes, setExpandedNotes] = useState({});
  const [filters, setFilters] = useState({});
  const [showColumnFilters, setShowColumnFilters] = useState(false);
  const [showSuggestedRoute, setShowSuggestedRoute] = useState(false);
  const [suggestError, setSuggestError] = useState(null);
  const [suggestedRoutes, setSuggestedRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(null);
  const [routeLaneId, setRouteLaneId] = useState(null);
  const [suggestSource, setSuggestSource] = useState(null); // 'airport' | 'location'
  const [savedLaneId, setSavedLaneId] = useState(null);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [tatMessage, setTatMessage] = useState(null);
  const [syncToast, setSyncToast] = useState(null);
  const [syncingLaneIds, setSyncingLaneIds] = useState(new Set());
  const [validationProgress, setValidationProgress] = useState(null);
  // null = idle, { status, percentage, currentLane, totalLanes, validCount, invalidCount, scheduleMismatchCount, message } = active/done
  const [validateAndSavingLaneIds, setValidateAndSavingLaneIds] = useState(new Set());
  const [laneValidationErrors, setLaneValidationErrors] = useState({});
  // { [laneId]: { laneErrors: string[], legErrors: { [sequence]: { errors: string[], suggestedAlternatives: AlternativeFlightDTO[] } } } }
  const [viableFlights, setViableFlights] = useState({});
  // { [`${laneId}-${sequence}`]: { loading, flights, error } }
  const [openViableFlightsKey, setOpenViableFlightsKey] = useState(null);
  const [scheduleMismatchData, setScheduleMismatchData] = useState({});
  // { [laneId]: { hasSuggestedTimes, applySuggestedTimesMessage, legs: [{ legId, sequence, flightNumber, departureTime, arrivalTime, suggestedDepartureTime, suggestedArrivalTime }] } }
  const [applyingTimesLaneIds, setApplyingTimesLaneIds] = useState(new Set());
  const [showCreateLaneModal, setShowCreateLaneModal] = useState(false);

  const handleSuggestRoute = async laneId => {
    setRouteLaneId(laneId);
    setSuggestSource('airport');
    try {
      setSuggestError(null);
      const lane = lanes.find(l => l.id === laneId);
      if (!lane || !lane.legs || lane.legs.length === 0) {
        setSuggestError('Lane has no legs to suggest a route for.');
        return;
      }

      const sortedLegs = [...lane.legs].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
      const payload = {
        itemNumber: lane.itemNumber,
        originAirport: sortedLegs[0]?.originStation,
        destinationAirport: sortedLegs.at(-1)?.destinationStation,
        collectionTime: lane.pickUpTime,
      };

      if (!payload.originAirport || !payload.destinationAirport) {
        setSuggestError('Origin and destination airports must be set in the legs.');
        return;
      }

      const results = await getSuggestedRoute(payload);
      setSuggestedRoutes(results);
      setSelectedRouteIndex(null);
      setShowSuggestedRoute(true);
    } catch (error) {
      let message = 'Failed to suggest route.';
      if (error.message) message = error.message;
      else if (error.response?.data?.error) message = error.response.data.error;
      setSuggestedRoutes([]);
      setSuggestError(message);
      setExpandedLanes(prev => ({ ...prev, [laneId]: true }));
    }
  };

  const handleSuggestRouteByLocation = async laneId => {
    setRouteLaneId(laneId);
    setSuggestSource('location');
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
      setExpandedLanes(prev => ({ ...prev, [laneId]: true }));
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
    postArrivalHandlingTime: 'Post Arrival Handling',
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
        else {
          // Reset hasBeenUpdated to false for all lanes on initial load
          const cleanedData = data.map(lane => ({ ...lane, hasBeenUpdated: false }));
          setLanes(cleanedData);
        }
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

  const handleEditNameSuccess = async () => {
    try {
      const data = await getLaneMappingById(laneMappingId);
      setLaneMapping(data);
    } catch (error) {
      console.error('Error refetching lane mapping:', error);
    }
  };

  const hourColumns = [
    'driveToAirportDuration',
    'postArrivalHandlingTime',
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
    setLaneValidationErrors(prev => ({ ...prev, [laneId]: null }));
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
            originStation: [...lane.legs].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))[0]?.originStation || '',
            destinationStation: [...lane.legs].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0)).at(-1)?.destinationStation || '',
          }
          : lane
      )
    );
    setLaneValidationErrors(prev => ({ ...prev, [laneId]: null }));
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


  const computeTATForLane = async laneId => {
    setLoading(true);
    try {
      const laneToCalculate = lanes.find(l => l.id === laneId);
      if (!laneToCalculate) return;
      const tatTime = await getTAT(laneToCalculate, laneToCalculate.legs || []);
      setLanes(current =>
        current.map(lane =>
          lane.id === laneId ? { ...lane, tatToConsigneeDuration: tatTime, hasBeenUpdated: true } : lane
        )
      );
    } catch (error) {
      setError('Error calculating TAT.');
    } finally {
      setLoading(false);
    }
  };

  const computeAllTAT = async () => {
    setLoading(true);
    setTatMessage(null);
    try {
      const result = await calculateAllTAT(laneMappingId);
      if (result.status === 'success') {
        setTatMessage(`TAT calculated: ${result.data.processed} lanes processed, ${result.data.skipped} skipped`);
        const freshLanes = await getLanesByLaneMappingId(laneMappingId);
        setLanes(freshLanes.map(lane => ({ ...lane, hasBeenUpdated: false })));
        setTimeout(() => setTatMessage(null), 5000);
      } else {
        setError(result.message || 'Failed to calculate TAT for all lanes');
      }
    } catch (err) {
      setError('Error calculating TAT for all lanes.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkValidate = async () => {
    setValidationProgress({ status: 'validating', percentage: 0, currentLane: 0, totalLanes: 0, validCount: 0, invalidCount: 0, scheduleMismatchCount: 0, message: 'Starting validation...' });
    try {
      await validateLaneMappingWithProgress(laneMappingId, {
        onProgress: data => setValidationProgress({ ...data, status: 'validating' }),
        onComplete: async data => {
          setValidationProgress({ ...data, status: 'completed' });
          const freshLanes = await getLanesByLaneMappingId(laneMappingId);
          setLanes(freshLanes.map(lane => ({ ...lane, hasBeenUpdated: false })));
        },
        onError: data => setValidationProgress({ ...data, status: 'error' }),
      });
    } catch (err) {
      setValidationProgress(prev => ({ ...prev, status: 'error', message: err.message || 'Validation failed' }));
    }
  };

  // Merge sync result into legs — updates times AND validity
  const mergeSyncLegs = (laneLegs, resultLegs) => {
    if (!resultLegs?.length) return laneLegs;
    return laneLegs.map(leg => {
      const updated = resultLegs.find(r => r.legId === leg.id);
      if (!updated) return leg;
      return {
        ...leg,
        valid: updated.valid,
        validMessage: updated.validationMessages || [],
        departureTime: updated.departureTime ?? leg.departureTime,
        arrivalTime: updated.arrivalTime ?? leg.arrivalTime,
      };
    });
  };

  const handleValidateAndSave = async laneId => {
    setValidateAndSavingLaneIds(prev => new Set(prev).add(laneId));
    setLaneValidationErrors(prev => ({ ...prev, [laneId]: null }));
    try {
      const lane = lanes.find(l => l.id === laneId);
      if (!lane) return;
      const result = await validateAndSaveLane(laneId, lane, lane.legs || []);
      setLanes(current =>
        current.map(l => {
          if (l.id !== laneId) return l;
          if (result.lane) return { ...result.lane, hasBeenUpdated: false };
          return { ...l, hasBeenUpdated: false };
        })
      );
      if (result.validationStatus === 'SCHEDULE_MISMATCH') {
        setScheduleMismatchData(prev => ({
          ...prev,
          [laneId]: {
            hasSuggestedTimes: result.hasSuggestedTimes ?? false,
            applySuggestedTimesMessage: result.applySuggestedTimesMessage || 'Click to apply the suggested times from the current flight schedule.',
            legs: result.legs || [],
          },
        }));
        setExpandedLanes(prev => ({ ...prev, [laneId]: true }));
      } else if (result.validationStatus === 'INVALID' && result.validationResult) {
        const legErrorsMap = {};
        (result.validationResult.legErrors || []).forEach(le => {
          legErrorsMap[le.sequence] = {
            errors: le.errors || [],
            suggestedAlternatives: le.suggestedAlternatives || [],
          };
        });
        setLaneValidationErrors(prev => ({
          ...prev,
          [laneId]: {
            laneErrors: result.validationResult.laneErrors || [],
            legErrors: legErrorsMap,
          },
        }));
        setExpandedLanes(prev => ({ ...prev, [laneId]: true }));
      } else {
        setScheduleMismatchData(prev => { const next = { ...prev }; delete next[laneId]; return next; });
        setSavedLaneId(laneId);
        setTimeout(() => setSavedLaneId(null), 3000);
      }
    } catch (err) {
      if (err.status === 422 && err.validationResult) {
        const legErrorsMap = {};
        (err.validationResult.legErrors || []).forEach(le => {
          legErrorsMap[le.sequence] = {
            errors: le.messages || le.errors || [],
            suggestedAlternatives: le.suggestedAlternatives || [],
          };
        });
        setLaneValidationErrors(prev => ({
          ...prev,
          [laneId]: {
            laneErrors: err.validationResult.laneErrors || [],
            legErrors: legErrorsMap,
          },
        }));
        setExpandedLanes(prev => ({ ...prev, [laneId]: true }));
      } else {
        alert(err.message || 'Validate and save failed');
      }
    } finally {
      setValidateAndSavingLaneIds(prev => {
        const next = new Set(prev);
        next.delete(laneId);
        return next;
      });
    }
  };

  const handleApplySuggestedTimes = async laneId => {
    setApplyingTimesLaneIds(prev => new Set(prev).add(laneId));
    setScheduleMismatchData(prev => { const next = { ...prev }; delete next[laneId]; return next; });
    try {
      const result = await applySuggestedTimes(laneId);
      setLanes(current =>
        current.map(lane => {
          if (lane.id !== laneId) return lane;
          return {
            ...lane,
            validationStatus: result.validationStatus ?? lane.validationStatus,
            syncMessage: null,
            legs: result.legs?.length ? mergeSyncLegs(lane.legs || [], result.legs) : lane.legs,
          };
        })
      );
      setSyncToast('Flight times updated successfully!');
      setTimeout(() => setSyncToast(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to apply suggested times');
    } finally {
      setApplyingTimesLaneIds(prev => { const next = new Set(prev); next.delete(laneId); return next; });
    }
  };

  const handleSyncSchedule = async laneId => {
    setSyncingLaneIds(prev => new Set(prev).add(laneId));
    setScheduleMismatchData(prev => { const next = { ...prev }; delete next[laneId]; return next; });
    try {
      const result = await syncLaneSchedule(laneId);
      setLanes(current =>
        current.map(lane =>
          lane.id === laneId
            ? {
                ...lane,
                validationStatus: result.validationStatus,
                syncMessage: null,
                legs: mergeSyncLegs(lane.legs || [], result.legs),
              }
            : lane
        )
      );
      setSyncToast('Times updated successfully!');
      setTimeout(() => setSyncToast(null), 4000);
    } catch (err) {
      alert(err.message || 'Schedule sync failed');
    } finally {
      setSyncingLaneIds(prev => {
        const next = new Set(prev);
        next.delete(laneId);
        return next;
      });
    }
  };

  const handleSearchViableFlights = async (laneId, legSequence, origin, destination, pickupTime, driveToAirportDuration) => {
    const key = `${laneId}-${legSequence}`;
    if (openViableFlightsKey === key) {
      setOpenViableFlightsKey(null);
      return;
    }
    setOpenViableFlightsKey(key);
    setViableFlights(prev => ({ ...prev, [key]: { loading: true, flights: [], error: null } }));
    try {
      let flights;
      if (pickupTime && driveToAirportDuration) {
        const driveMinutes = (parseInt(driveToAirportDuration) || 0) * 60;
        flights = await getViableFlights(origin, destination, pickupTime, driveMinutes);
      } else {
        flights = await getCachedFlights(origin, destination);
      }
      setViableFlights(prev => ({ ...prev, [key]: { loading: false, flights, error: null } }));
    } catch (err) {
      setViableFlights(prev => ({ ...prev, [key]: { loading: false, flights: [], error: err.message } }));
    }
  };

  const applyAlternative = (laneId, legSequence, alt) => {
    setLanes(current =>
      current.map(lane =>
        lane.id === laneId
          ? {
              ...lane,
              hasBeenUpdated: true,
              legs: lane.legs.map(leg =>
                leg.sequence === legSequence
                  ? {
                      ...leg,
                      flightNumber: alt.flightNumber,
                      departureTime: alt.departureTime,
                      arrivalTime: alt.arrivalTime,
                      flightOperatingDays: alt.operatingDays,
                    }
                  : leg
              ),
            }
          : lane
      )
    );
    setLaneValidationErrors(prev => ({ ...prev, [laneId]: null }));
  };

  const getValidationStatusDisplay = lane => {
    const status = lane.validationStatus;
    if (status === 'PENDING') return { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock };
    if (status === 'VALID') return { label: 'Valid', color: 'bg-green-100 text-green-700', icon: CheckCircle };
    if (status === 'INVALID') return { label: 'Invalid', color: 'bg-red-100 text-red-700', icon: XCircle };
    if (status === 'SCHEDULE_MISMATCH') return { label: 'Outdated Schedule', color: 'bg-orange-100 text-orange-700', icon: AlertTriangle };
    return { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock };
  };

  const getLaneErrorMessages = lane => {
    if (!lane?.errorMessages || !Array.isArray(lane.errorMessages) || lane.errorMessages.length === 0) {
      return null;
    }
    return lane.errorMessages;
  };

  const formatDateTime = val => {
    if (!val) return null;
    return new Date(val).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  };

  const formatDate = val => {
    if (!val) return null;
    return new Date(val).toLocaleDateString(undefined, { dateStyle: 'medium' });
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
      if (field === 'validationStatus') {
        return (lane.validationStatus || 'PENDING') === value;
      }
      if (field === 'tatStatus') {
        const tat = (lane.tatToConsigneeDuration || '').toString().trim().toLowerCase();
        if (value === 'tbd') return !tat || tat === 'tbd';
        if (value === 'calculated') return tat && tat !== 'tbd';
        return true;
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


  const handleDeleteLane = async id => {
    if (!window.confirm('Are you sure you want to delete this lane? This action cannot be undone.')) {
      return;
    }
    setLoading(true);
    try {
      await deleteLaneById(id);
      setLanes(current => current.filter(lane => lane.id !== id));
    } catch (error) {
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
            <p className="text-blue-200 text-sm font-medium">{laneMapping?.accountName || 'Account'}</p>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{laneMapping?.name || 'Lane Mapping'} Lanes</h1>
              <button
                onClick={() => setShowEditNameModal(true)}
                className="p-1.5 rounded-full bg-blue-500 hover:bg-blue-400 transition"
                aria-label="Edit lane mapping name"
              >
                <Pencil size={14} />
              </button>
            </div>
            <p className="text-blue-100 text-sm mt-1">
              {filteredLanes.length} lane{filteredLanes.length !== 1 ? 's' : ''} displayed
              {lanes.length > 0 && lanes.length !== filteredLanes.length && ` of ${lanes.length} total`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateLaneModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400 transition shadow-sm border border-blue-400"
            >
              <Plus size={17} />
              New Lane
            </button>
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
      </div>

      {/* TAT Success Display */}
      {tatMessage && (
        <div className="bg-green-50 border-b border-green-200 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle size={18} />
              {tatMessage}
            </div>
            <button
              onClick={() => setTatMessage(null)}
              className="text-green-700 hover:text-green-900 p-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Sync Schedule Toast */}
      {syncToast && (
        <div className="bg-green-50 border-b border-green-200 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle size={18} />
              {syncToast}
            </div>
            <button onClick={() => setSyncToast(null)} className="text-green-700 hover:text-green-900 p-1">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Validation Progress */}
      {validationProgress && (
        <div className={`border-b px-6 py-4 ${validationProgress.status === 'error' ? 'bg-red-50 border-red-200' : validationProgress.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-semibold ${validationProgress.status === 'error' ? 'text-red-700' : validationProgress.status === 'completed' ? 'text-green-700' : 'text-blue-700'}`}>
                {validationProgress.status === 'validating' && 'Validating Lanes...'}
                {validationProgress.status === 'completed' && 'Validation Complete'}
                {validationProgress.status === 'error' && 'Validation Failed'}
              </span>
              <div className="flex items-center gap-3">
                {validationProgress.status !== 'validating' && (
                  <button
                    onClick={() => setValidationProgress(null)}
                    className="text-gray-500 hover:text-gray-700 p-1"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {validationProgress.status !== 'error' && (
              <>
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-300 ${validationProgress.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${validationProgress.percentage ?? 0}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{validationProgress.message || `${validationProgress.currentLane ?? 0}/${validationProgress.totalLanes ?? 0} lanes validated`}</span>
                  <span className="font-medium">{validationProgress.percentage ?? 0}%</span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className="flex items-center gap-1 text-green-700">
                    <CheckCircle size={13} /> Valid: <strong>{validationProgress.validCount ?? 0}</strong>
                  </span>
                  <span className="flex items-center gap-1 text-red-700">
                    <XCircle size={13} /> Invalid: <strong>{validationProgress.invalidCount ?? 0}</strong>
                  </span>
                  <span className="flex items-center gap-1 text-orange-600">
                    <AlertTriangle size={13} /> Outdated: <strong>{validationProgress.scheduleMismatchCount ?? 0}</strong>
                  </span>
                </div>
              </>
            )}

            {validationProgress.status === 'error' && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-600">{validationProgress.message}</span>
                <button
                  onClick={() => { setValidationProgress(null); handleBulkValidate(); }}
                  className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && !loading && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-red-700">
            <XCircle size={18} />
            {error}
          </div>
        </div>
      )}


      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-2 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Search lanes..."
              value={filters.quickFilter || ''}
              onChange={e => setFilters({ ...filters, quickFilter: e.target.value })}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-52"
            />
            <select
              value={filters.validationStatus || ''}
              onChange={e => setFilters(prev => ({ ...prev, validationStatus: e.target.value }))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="VALID">Valid</option>
              <option value="INVALID">Invalid</option>
              <option value="SCHEDULE_MISMATCH">Outdated Schedule</option>
            </select>
            <button
              onClick={() => setShowColumnFilters(!showColumnFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${showColumnFilters || activeFilterCount > 0
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                }`}
            >
              <Filter size={13} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
              )}
            </button>
            <button
              onClick={handleBulkValidate}
              disabled={validationProgress?.status === 'validating' || loading}
              className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600 transition disabled:opacity-50"
            >
              {validationProgress?.status === 'validating' ? (
                <><svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg> Validating...</>
              ) : (
                <><CheckCircle size={13} /> Validate All</>
              )}
            </button>
            <button
              onClick={computeAllTAT}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Clock size={13} />
              Calc TAT
            </button>
            {(filters.quickFilter || activeFilterCount > 0) && (
              <button onClick={handleClearFilters} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition flex items-center gap-1">
                <X size={13} /> Clear
              </button>
            )}
          </div>

          {/* Collapsible Column Filters */}
          {showColumnFilters && (
            <div className="mt-2 pt-2 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {['originStation', 'destinationStation', 'originCity', 'originState', 'originCountry', 'destinationCity', 'destinationState', 'destinationCountry', 'itemNumber', 'laneOption'].map(col => (
                <div key={col}>
                  <label className="block text-[10px] font-medium text-gray-500 mb-0.5">{columnLabels[col]}</label>
                  <select
                    value={filters[col] || ''}
                    onChange={e => setFilters(prev => ({ ...prev, [col]: e.target.value }))}
                    className={`w-full px-2 py-1 text-xs border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${filters[col] ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                  >
                    <option value="">All</option>
                    {getUniqueValues(col).map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">TAT Status</label>
                <select
                  value={filters.tatStatus || ''}
                  onChange={e => setFilters(prev => ({ ...prev, tatStatus: e.target.value }))}
                  className={`w-full px-2 py-1 text-xs border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${filters.tatStatus ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                >
                  <option value="">All</option>
                  <option value="tbd">TBD Only</option>
                  <option value="calculated">Calculated Only</option>
                </select>
              </div>
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
              className={`bg-white rounded-xl border shadow-md transition-all overflow-hidden ${lane.hasBeenUpdated ? 'border-amber-300 ring-1 ring-amber-200' : expandedLanes[lane.id] ? 'border-blue-400 ring-1 ring-blue-100' : 'border-gray-200 hover:border-gray-300'} hover:shadow-lg ${expandedLanes[lane.id] ? 'border-l-4 border-l-blue-500' : 'hover:border-l-4 hover:border-l-blue-300'}`}
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
                <div className="flex items-center gap-4 shrink-0">
                  <div>
                    <div className="text-2xl font-bold text-slate-900 tracking-wide leading-none">{lane.originStation || '---'}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{[lane.originCity, lane.originState, lane.originCountry].filter(Boolean).join(', ') || '---'}</div>
                  </div>
                  <div className="flex items-center gap-2 group">
                    <div className="h-px w-8 bg-slate-300 group-hover:bg-blue-300 transition-colors" />
                    <div className="h-9 w-9 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-sm shrink-0 group-hover:bg-blue-100 group-hover:border-blue-400 transition-colors">
                      <Plane size={15} />
                    </div>
                    <div className="h-px w-8 bg-slate-300 group-hover:bg-blue-300 transition-colors" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900 tracking-wide leading-none">{lane.destinationStation || '---'}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{[lane.destinationCity, lane.destinationState, lane.destinationCountry].filter(Boolean).join(', ') || '---'}</div>
                  </div>
                </div>

                {/* Info Cards */}
                <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden">
                  {(() => {
                    const opt = lane.laneOption?.toLowerCase();
                    const optCls = opt === 'primary'     ? 'bg-green-100 border-green-400 text-green-600'
                                 : opt === 'secondary'   ? 'bg-amber-100 border-amber-400 text-amber-600'
                                 : opt === 'alternative' ? 'bg-gray-100 border-gray-400 text-gray-500'
                                 :                        'bg-gray-50 border-gray-300 text-gray-400';
                    const optVal = opt === 'primary'     ? 'text-green-800 font-bold'
                                 : opt === 'secondary'   ? 'text-amber-800 font-bold'
                                 :                        'text-gray-700';
                    return [
                      { label: 'Item',     value: lane.itemNumber,                         cls: 'bg-gray-50 border-gray-200 text-gray-400', val: 'text-gray-700' },
                      { label: 'Option',   value: lane.laneOption,                         cls: optCls, val: optVal },
                      { label: 'Pickup',   value: lane.pickUpTime,                         cls: 'bg-gray-50 border-gray-200 text-gray-400', val: 'text-gray-700' },
                      { label: 'Delivery', value: lane.actualDeliveryTimeBasedOnReceiving, cls: 'bg-gray-50 border-gray-200 text-gray-400', val: 'text-gray-700' },
                      { label: 'TAT',      value: lane.tatToConsigneeDuration,             cls: 'bg-gray-50 border-gray-200 text-gray-400', val: 'text-gray-700 font-bold' },
                    ].map(({ label, value, cls, val }) => (
                      <div key={label} className={`rounded-xl px-2.5 py-1 border shrink-0 ${cls}`}>
                        <div className={`text-[10px] uppercase tracking-wide leading-none ${cls.split(' ')[2]}`}>{label}</div>
                        <div className={`text-xs mt-0.5 font-semibold leading-none ${val}`}>{value || '—'}</div>
                      </div>
                    ));
                  })()}
                </div>

                {/* Status + Actions */}
                <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                  {/* Status badges group */}
                  <div className="flex items-center gap-1.5">
                    {lane.hasBeenUpdated && (
                      <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 text-xs font-medium">Unsaved</span>
                    )}
                    {savedLaneId === lane.id && (
                      <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-xs font-medium animate-pulse">Saved!</span>
                    )}
                    {(() => {
                      const vs = getValidationStatusDisplay(lane);
                      const StatusIcon = vs.icon;
                      return (
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${vs.color}`}>
                          <StatusIcon size={12} />
                          {vs.label}
                        </span>
                      );
                    })()}
                    {getLaneErrorMessages(lane) && (
                      <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-xs font-medium">
                        {getLaneErrorMessages(lane).length} error{getLaneErrorMessages(lane).length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {lane.lastValidatedAt && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={11} />
                        {formatDateTime(lane.lastValidatedAt)}
                      </span>
                    )}
                    {lane.syncMessage && lane.validationStatus === 'SCHEDULE_MISMATCH' && (
                      <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded px-2 py-0.5 max-w-[180px] truncate" title={lane.syncMessage}>
                        <AlertTriangle size={11} />
                        {lane.syncMessage}
                      </span>
                    )}
                  </div>

                  {/* Primary action */}
                  {lane.validationStatus === 'SCHEDULE_MISMATCH' && scheduleMismatchData[lane.id]?.hasSuggestedTimes && (
                    <button
                      onClick={() => handleApplySuggestedTimes(lane.id)}
                      disabled={applyingTimesLaneIds.has(lane.id) || loading}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {applyingTimesLaneIds.has(lane.id) ? <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg> : <CheckCircle size={12} />}
                      Apply
                    </button>
                  )}
                  {lane.validationStatus === 'SCHEDULE_MISMATCH' && (
                    <button
                      onClick={() => handleSyncSchedule(lane.id)}
                      disabled={syncingLaneIds.has(lane.id) || loading}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600 transition disabled:opacity-50"
                    >
                      {syncingLaneIds.has(lane.id) ? <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg> : <RefreshCw size={12} />}
                      Sync
                    </button>
                  )}
                  {lane.validationStatus !== 'SCHEDULE_MISMATCH' && (
                    <button
                      onClick={() => handleValidateAndSave(lane.id)}
                      disabled={validateAndSavingLaneIds.has(lane.id) || loading}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition disabled:opacity-50 whitespace-nowrap"
                    >
                      {validateAndSavingLaneIds.has(lane.id) ? <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg> : <CheckCircle size={12} />}
                      Validate & Save
                    </button>
                  )}

                  {/* Divider */}
                  <div className="w-px h-5 bg-gray-200 mx-1" />

                  {/* Utility icons pushed right */}
                  <button onClick={() => computeTATForLane(lane.id)} disabled={loading} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-blue-600 disabled:opacity-50" title="Calculate TAT">
                    <Clock size={15} />
                  </button>
                  <button onClick={() => handleDeleteLane(lane.id)} disabled={loading} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-600 disabled:opacity-50" title="Delete Lane">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Expanded Detail Panel */}
              {expandedLanes[lane.id] && (
                <div className="border-t border-gray-200 bg-gray-50 px-5 py-3">
                  {/* Schedule Mismatch Banner */}
                  {scheduleMismatchData[lane.id] && (
                    <div className="mb-4 p-4 bg-amber-50 border border-amber-300 rounded-lg">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-amber-800">Flight times don't match current schedule</p>
                            {scheduleMismatchData[lane.id].applySuggestedTimesMessage && (
                              <p className="text-xs text-amber-700 mt-0.5">{scheduleMismatchData[lane.id].applySuggestedTimesMessage}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setScheduleMismatchData(prev => { const next = { ...prev }; delete next[lane.id]; return next; })}
                          className="p-1 text-amber-500 hover:text-amber-700 shrink-0"
                          title="Dismiss"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      {scheduleMismatchData[lane.id].legs?.some(l => l.suggestedDepartureTime || l.suggestedArrivalTime) && (
                        <div className="mb-3 overflow-x-auto">
                          <table className="text-xs w-full">
                            <thead>
                              <tr className="text-amber-700 border-b border-amber-200">
                                <th className="text-left pb-1.5 pr-4 font-medium">Leg</th>
                                <th className="text-left pb-1.5 pr-4 font-medium">Flight</th>
                                <th className="text-left pb-1.5 pr-4 font-medium">Current Dep → Arr</th>
                                <th className="text-left pb-1.5 font-medium">Suggested Dep → Arr</th>
                              </tr>
                            </thead>
                            <tbody>
                              {scheduleMismatchData[lane.id].legs.map((leg, i) => (
                                <tr key={i} className="border-b border-amber-100">
                                  <td className="py-1.5 pr-4 font-medium">{leg.sequence}</td>
                                  <td className="py-1.5 pr-4">{leg.flightNumber}</td>
                                  <td className="py-1.5 pr-4">
                                    <span className={leg.suggestedDepartureTime || leg.suggestedArrivalTime ? 'line-through text-gray-400' : ''}>
                                      {leg.departureTime} → {leg.arrivalTime}
                                    </span>
                                  </td>
                                  <td className="py-1.5">
                                    {(leg.suggestedDepartureTime || leg.suggestedArrivalTime) ? (
                                      <span className="text-green-700 font-medium">
                                        {leg.suggestedDepartureTime ?? leg.departureTime} → {leg.suggestedArrivalTime ?? leg.arrivalTime}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400 italic">no change</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        {scheduleMismatchData[lane.id].hasSuggestedTimes && (
                          <button
                            onClick={() => handleApplySuggestedTimes(lane.id)}
                            disabled={applyingTimesLaneIds.has(lane.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition disabled:opacity-50"
                          >
                            {applyingTimesLaneIds.has(lane.id) ? (
                              <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            ) : (
                              <CheckCircle size={12} />
                            )}
                            Apply All Suggested Times
                          </button>
                        )}
                        <button
                          onClick={() => handleSyncSchedule(lane.id)}
                          disabled={syncingLaneIds.has(lane.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600 transition disabled:opacity-50"
                        >
                          <RefreshCw size={12} />
                          Sync from Schedule API
                        </button>
                        <button
                          onClick={() => setScheduleMismatchData(prev => { const next = { ...prev }; delete next[lane.id]; return next; })}
                          className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-100 transition"
                        >
                          Edit Manually
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Validation Errors (from Validate & Save 422) */}
                  {laneValidationErrors[lane.id]?.laneErrors?.length > 0 && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs font-semibold text-red-700 mb-1 flex items-center gap-1">
                        <XCircle size={13} /> Validation Errors
                      </p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {laneValidationErrors[lane.id].laneErrors.map((msg, i) => (
                          <li key={i} className="text-xs text-red-600">{msg}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Lane Error Messages (from backend lane property) — hidden when validation errors already shown to avoid duplication */}
                  {getLaneErrorMessages(lane) && !laneValidationErrors[lane.id]?.laneErrors?.length && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs font-semibold text-red-700 mb-1 flex items-center gap-1">
                        <XCircle size={13} /> Lane Error Messages
                      </p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {getLaneErrorMessages(lane).map((msg, i) => (
                          <li key={i} className="text-xs text-red-600">{msg}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Location Details */}
                  <div className="mb-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <MapPin size={13} className="text-gray-400" />
                      Location Details
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white rounded-lg border border-gray-200 p-2.5">
                        <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Origin</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-0.5">City</label>
                            <input
                              type="text"
                              value={lane.originCity || ''}
                              onChange={e => handleLaneChange(lane.id, 'originCity', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">State</label>
                            <input
                              type="text"
                              value={lane.originState || ''}
                              onChange={e => handleLaneChange(lane.id, 'originState', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Country</label>
                            <input
                              type="text"
                              value={lane.originCountry || ''}
                              onChange={e => handleLaneChange(lane.id, 'originCountry', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-200 p-2.5">
                        <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Destination</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-0.5">City</label>
                            <input
                              type="text"
                              value={lane.destinationCity || ''}
                              onChange={e => handleLaneChange(lane.id, 'destinationCity', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">State</label>
                            <input
                              type="text"
                              value={lane.destinationState || ''}
                              onChange={e => handleLaneChange(lane.id, 'destinationState', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Country</label>
                            <input
                              type="text"
                              value={lane.destinationCountry || ''}
                              onChange={e => handleLaneChange(lane.id, 'destinationCountry', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Lane Option</label>
                          <select
                            value={lane.laneOption || ''}
                            onChange={e => handleLaneChange(lane.id, 'laneOption', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Drive to Airport</label>
                          <input
                            type="text"
                            value={lane.driveToAirportDuration || ''}
                            onChange={e => handleLaneChange(lane.id, 'driveToAirportDuration', e.target.value)}
                            placeholder="e.g. 3hr"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Service Level</label>
                          <input
                            type="text"
                            value={lane.serviceLevel || ''}
                            onChange={e => handleLaneChange(lane.id, 'serviceLevel', e.target.value)}
                            placeholder="e.g. NFO, DIRECT DRIVE"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Flight Legs */}
                  <div className="mb-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Plane size={13} className="text-gray-400" />
                        Flight Legs
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSuggestRoute(lane.id)}
                          disabled={loading}
                          className="flex items-center gap-1 px-3 py-1.5 border border-purple-300 text-purple-700 text-xs font-medium rounded-lg hover:bg-purple-50 active:bg-purple-200 active:scale-95 active:border-purple-400 transition-all disabled:opacity-50"
                          title="Suggest Route by Airport"
                        >
                          <Lightbulb size={13} />
                          Suggest (Airport)
                        </button>
                        <button
                          onClick={() => handleSuggestRouteByLocation(lane.id)}
                          disabled={loading}
                          className="flex items-center gap-1 px-3 py-1.5 border border-teal-300 text-teal-700 text-xs font-medium rounded-lg hover:bg-teal-50 active:bg-teal-200 active:scale-95 active:border-teal-400 transition-all disabled:opacity-50"
                          title="Suggest Route by Location"
                        >
                          <MapPin size={13} />
                          Suggest (Location)
                        </button>
                        <button
                          onClick={() => handleAddLeg(lane.id)}
                          disabled={(lane.legs?.length ?? 0) >= 3}
                          title={(lane.legs?.length ?? 0) >= 3 ? 'Maximum of 3 legs allowed' : undefined}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Plus size={14} />
                          Add Leg
                        </button>
                      </div>
                    </h3>
                    {suggestError && routeLaneId === lane.id && (
                      <div className="mb-3 flex items-start justify-between gap-2 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-2.5 text-xs text-yellow-800">
                        <div className="flex items-center gap-2">
                          <Lightbulb size={14} className="shrink-0 text-yellow-600" />
                          <span>{suggestError}</span>
                        </div>
                        <button onClick={() => setSuggestError(null)} className="shrink-0 text-yellow-500 hover:text-yellow-700">
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    {showSuggestedRoute && suggestedRoutes.length > 0 && routeLaneId === lane.id && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`flex items-center gap-2 text-xs font-semibold ${suggestSource === 'location' ? 'text-teal-700' : 'text-purple-700'}`}>
                            {suggestSource === 'location' ? <MapPin size={14} className="text-teal-500" /> : <Lightbulb size={14} className="text-purple-500" />}
                            Suggested Routes
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${suggestSource === 'location' ? 'bg-teal-100 text-teal-700' : 'bg-purple-100 text-purple-700'}`}>
                              {suggestSource === 'location' ? 'by Location' : 'by Airport'}
                            </span>
                          </span>
                          <button
                            onClick={() => {
                              setShowSuggestedRoute(false);
                              setSuggestedRoutes([]);
                              setSelectedRouteIndex(null);
                              setRouteLaneId(null);
                              setSuggestSource(null);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {suggestedRoutes.map((routePattern, routeIndex) => (
                            <div
                              key={routeIndex}
                              className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${selectedRouteIndex === routeIndex
                                ? 'border-green-500 bg-green-50 shadow-md'
                                : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
                                }`}
                              onClick={() => setSelectedRouteIndex(routeIndex)}
                            >
                              <p className="text-xs font-bold text-gray-800 mb-1">Option {routeIndex + 1}</p>
                              <p className="text-xs text-gray-500 mb-3">
                                {routePattern.originStation} → {routePattern.destinationStation}
                              </p>
                              <div className="space-y-1.5 mb-3 max-h-40 overflow-y-auto">
                                {routePattern.legs
                                  .sort((a, b) => a.sequence - b.sequence)
                                  .map((leg, i) => (
                                    <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs">
                                      <p className="font-semibold text-gray-700">{leg.flightNumber}</p>
                                      <p className="text-gray-500">{leg.originStation} → {leg.destinationStation} · {leg.departureTime} – {leg.arrivalTime}</p>
                                    </div>
                                  ))}
                              </div>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  if (selectedRouteIndex === routeIndex) {
                                    applyRoute(routePattern);
                                  } else {
                                    setSelectedRouteIndex(routeIndex);
                                  }
                                }}
                                className={`w-full px-3 py-1.5 rounded-lg text-xs font-semibold transition ${selectedRouteIndex === routeIndex
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
                            {[...lane.legs].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0)).map((leg, legIdx) => (
                              <React.Fragment key={leg.id || legIdx}>
                                <tr
                                  className={`border-b border-gray-100 ${legIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
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
                                        (() => {
                                          const legErrs = laneValidationErrors[lane.id]?.legErrors?.[leg.sequence];
                                          if (legErrs?.errors?.length > 0) {
                                            const hasNoFlightError = legErrs.errors.some(e => e.toLowerCase().includes('no flight schedule'));
                                            const hasSuggestions = hasNoFlightError && legErrs.suggestedAlternatives?.length > 0;
                                            return (
                                              <div>
                                                <div className="text-red-600 text-xs max-w-[250px] whitespace-normal break-words">
                                                  {legErrs.errors.join('; ')}
                                                </div>
                                                {hasSuggestions && (
                                                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg min-w-[320px]">
                                                    <p className="text-xs font-semibold text-blue-700 mb-1.5">
                                                      Available flights for {legErrs.suggestedAlternatives[0].origin} → {legErrs.suggestedAlternatives[0].destination}:
                                                    </p>
                                                    <table className="w-full text-xs">
                                                      <thead>
                                                        <tr className="text-gray-500">
                                                          <th className="text-left pb-1 pr-2 font-medium">Flight</th>
                                                          <th className="text-left pb-1 pr-2 font-medium">Dep</th>
                                                          <th className="text-left pb-1 pr-2 font-medium">Arr</th>
                                                          <th className="text-left pb-1 pr-2 font-medium">Days</th>
                                                          <th></th>
                                                        </tr>
                                                      </thead>
                                                      <tbody>
                                                        {legErrs.suggestedAlternatives.map((alt, idx) => (
                                                          <tr key={idx} className="border-t border-blue-100">
                                                            <td className="py-1 pr-2 font-medium">{alt.flightNumber}</td>
                                                            <td className="py-1 pr-2">{alt.departureTime}</td>
                                                            <td className="py-1 pr-2">{alt.arrivalTime}</td>
                                                            <td className="py-1 pr-2">{alt.operatingDays}</td>
                                                            <td className="py-1">
                                                              <button
                                                                onClick={() => applyAlternative(lane.id, leg.sequence, alt)}
                                                                className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition whitespace-nowrap"
                                                              >
                                                                Select
                                                              </button>
                                                            </td>
                                                          </tr>
                                                        ))}
                                                      </tbody>
                                                    </table>
                                                  </div>
                                                )}
                                                {hasNoFlightError && !hasSuggestions && (
                                                  <p className="mt-1 text-xs text-gray-500 italic">No alternative flights found for this route.</p>
                                                )}
                                              </div>
                                            );
                                          }
                                          if (leg.valid === false && leg.validMessage?.length > 0) {
                                            return (
                                              <div className="text-red-600 text-xs max-w-[250px] whitespace-normal break-words">
                                                {leg.validMessage.join('; ')}
                                              </div>
                                            );
                                          }
                                          if (leg.valid === true) return <CheckCircle size={16} className="text-green-500" />;
                                          return <span className="text-gray-400 text-xs">Pending</span>;
                                        })()
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
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleRemoveLeg(lane.id, leg.id)}
                                        className="p-1.5 hover:bg-red-100 text-red-600 rounded transition"
                                        title="Remove leg"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                      {leg.originStation && leg.destinationStation && (
                                        <button
                                          onClick={() => handleSearchViableFlights(lane.id, leg.sequence, leg.originStation, leg.destinationStation, lane.pickUpTime, lane.driveToAirportDuration)}
                                          className={`p-1.5 rounded transition ${openViableFlightsKey === `${lane.id}-${leg.sequence}` ? 'bg-blue-100 text-blue-700' : 'hover:bg-blue-100 text-blue-500'}`}
                                          title="Find available flights"
                                        >
                                          <Search size={14} />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                                {/* Aircraft by Day row */}
                                <tr
                                  className={`border-b border-gray-200 ${legIdx % 2 === 0 ? 'bg-blue-50/30' : 'bg-blue-50/50'
                                    }`}
                                >
                                  <td colSpan={legColumns.length + 1} className="px-3 py-1.5">
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className="font-medium text-gray-500">Aircraft by Day:</span>
                                      <span className="text-gray-700">
                                        {formatAircraftByDay(leg.aircraftByDay)}
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                                {/* Viable Flights panel */}
                                {openViableFlightsKey === `${lane.id}-${leg.sequence}` && (
                                  <tr className="border-b border-blue-200 bg-blue-50/40">
                                    <td colSpan={legColumns.length + 1} className="px-3 py-3">
                                      {(() => {
                                        const vf = viableFlights[`${lane.id}-${leg.sequence}`];
                                        if (!vf || vf.loading) {
                                          return (
                                            <div className="flex items-center gap-2 text-xs text-blue-600">
                                              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                              </svg>
                                              Searching flights for {leg.originStation} → {leg.destinationStation}...
                                            </div>
                                          );
                                        }
                                        if (vf.error) {
                                          return <p className="text-xs text-red-600">{vf.error}</p>;
                                        }
                                        if (!vf.flights?.length) {
                                          return <p className="text-xs text-gray-500 italic">No flights found for {leg.originStation} → {leg.destinationStation}.</p>;
                                        }
                                        return (
                                          <div>
                                            <p className="text-xs font-semibold text-blue-700 mb-1.5">
                                              {lane.pickUpTime && lane.driveToAirportDuration
                                                ? `Viable flights (pickup ${lane.pickUpTime} + ${lane.driveToAirportDuration} drive) for ${leg.originStation} → ${leg.destinationStation}:`
                                                : `All flights for ${leg.originStation} → ${leg.destinationStation}:`}
                                            </p>
                                            <table className="text-xs w-full max-w-2xl">
                                              <thead>
                                                <tr className="text-gray-500">
                                                  <th className="text-left pb-1 pr-3 font-medium">Flight</th>
                                                  <th className="text-left pb-1 pr-3 font-medium">Dep</th>
                                                  <th className="text-left pb-1 pr-3 font-medium">Arr</th>
                                                  <th className="text-left pb-1 pr-3 font-medium">Days</th>
                                                  <th></th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {vf.flights.map((f, fi) => (
                                                  <tr key={fi} className="border-t border-blue-100">
                                                    <td className="py-1 pr-3 font-medium">{f.flightNumber}</td>
                                                    <td className="py-1 pr-3">{f.departureTime}</td>
                                                    <td className="py-1 pr-3">{f.arrivalTime}</td>
                                                    <td className="py-1 pr-3">{f.operatingDays}</td>
                                                    <td className="py-1">
                                                      <button
                                                        onClick={() => { applyAlternative(lane.id, leg.sequence, f); setOpenViableFlightsKey(null); }}
                                                        className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition whitespace-nowrap"
                                                      >
                                                        Select
                                                      </button>
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        );
                                      })()}
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
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
                          disabled={(lane.legs?.length ?? 0) >= 3}
                          className="mt-3 text-blue-600 text-sm font-medium hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Add your first leg
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Post-Route Details */}
                  <div className="mb-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <Clock size={13} className="text-gray-400" />
                      Post-Route Details
                    </h3>
                    <div className="bg-white rounded-lg border border-gray-200 p-2.5">
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Post Arrival Handling</label>
                          <input
                            type="text"
                            value={lane.postArrivalHandlingTime || ''}
                            onChange={e => handleLaneChange(lane.id, 'postArrivalHandlingTime', e.target.value)}
                            placeholder="e.g. 3hr"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Drive to Destination</label>
                          <input
                            type="text"
                            value={lane.driveToDestination || ''}
                            onChange={e => handleLaneChange(lane.id, 'driveToDestination', e.target.value)}
                            placeholder="e.g. 3hr"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Delivery Time</label>
                          <input
                            type="text"
                            value={lane.actualDeliveryTimeBasedOnReceiving || ''}
                            onChange={e => handleLaneChange(lane.id, 'actualDeliveryTimeBasedOnReceiving', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">TAT Duration</label>
                          <input
                            type="text"
                            value={lane.tatToConsigneeDuration || ''}
                            onChange={e => handleLaneChange(lane.id, 'tatToConsigneeDuration', e.target.value)}
                            placeholder="e.g. 3hr"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="mb-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                      <FileText size={13} className="text-gray-400" />
                      Additional Notes
                    </h3>
                    {(!lane.additionalNotes && !expandedNotes[lane.id]) ? (
                      <button
                        onClick={() => setExpandedNotes(prev => ({ ...prev, [lane.id]: true }))}
                        className="w-full text-left px-3 py-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-400 hover:border-blue-300 hover:text-blue-400 transition-colors"
                      >
                        Click to add notes...
                      </button>
                    ) : (
                      <textarea
                        autoFocus={expandedNotes[lane.id] && !lane.additionalNotes}
                        value={lane.additionalNotes || ''}
                        onChange={e => handleLaneChange(lane.id, 'additionalNotes', e.target.value)}
                        onBlur={() => {
                          if (!lane.additionalNotes) setExpandedNotes(prev => ({ ...prev, [lane.id]: false }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[64px]"
                        placeholder="Enter any additional notes here..."
                      />
                    )}
                  </div>

                  {/* Lane History */}
                  {(lane.lastValidatedAt || lane.lastUpdate || lane.lastUpdatedBy) && (
                    <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600">
                      {lane.lastValidatedAt && (
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} className="text-gray-400" />
                          Last validated: <span className="font-semibold text-gray-700 ml-0.5">{formatDateTime(lane.lastValidatedAt)}</span>
                        </span>
                      )}
                      {lane.lastUpdate && (
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-gray-400" />
                          Last updated: <span className="font-semibold text-gray-700 ml-0.5">{formatDate(lane.lastUpdate)}</span>
                        </span>
                      )}
                      {lane.lastUpdatedBy && (
                        <span className="flex items-center gap-1.5">
                          <User size={12} className="text-gray-400" />
                          By: <span className="font-semibold text-gray-700 ml-0.5">{lane.lastUpdatedBy}</span>
                        </span>
                      )}
                    </div>
                  )}


                </div>
              )}
                {(() => {
                  const isDirectDrive = lane.serviceLevel?.trim().toUpperCase() === 'DIRECT DRIVE';
                  const sortedLegs = [...(lane.legs || [])].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
                  if (!isDirectDrive && sortedLegs.length === 0) return null;

                  const originCity = [lane.originCity, lane.originState, lane.originCountry].filter(Boolean).join(', ');
                  const destCity   = [lane.destinationCity, lane.destinationState, lane.destinationCountry].filter(Boolean).join(', ');

                  // Build flat items: alternating { type:'node' } and { type:'connector', flight? }
                  const items = [];
                  const addNode = n => items.push({ type: 'node', ...n });
                  const addConn = (flight = null) => items.push({ type: 'connector', flight });

                  addNode({ icon: 'truck', label: 'PICKUP', labelTop: true, cityLine: originCity || lane.originStation });

                  if (isDirectDrive) {
                    addConn();
                    addNode({ icon: 'drive', label: 'DIRECT DRIVE', labelTop: true });
                  } else {
                    sortedLegs.forEach((leg, i) => {
                      addConn();
                      addNode({ time: leg.departureTime, icon: 'dep', label: 'ETD', station: leg.originStation });
                      addConn(leg.flightNumber);
                      const isLast = i === sortedLegs.length - 1;
                      addNode({ time: leg.arrivalTime, icon: isLast ? 'arr' : 'connect', label: isLast ? 'ETA' : 'CONNECT', station: leg.destinationStation });
                    });
                  }
                  addConn();
                  addNode({ time: lane.actualDeliveryTimeBasedOnReceiving, icon: 'delivery', label: 'DELIVERY', cityLine: destCity || lane.destinationStation });

                  return (
                    <div className="border-t-2 border-gray-200 bg-gray-50 overflow-hidden">
                      <div className="flex items-center px-4 py-4 w-full">
                        {items.map((item, i) => {
                          if (item.type === 'connector') return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                              {item.flight
                                ? <span className="px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-base font-bold text-blue-700 whitespace-nowrap">{item.flight}</span>
                                : <div className="h-5" />}
                              <div className="w-full h-[3px] bg-blue-200 rounded-full" />
                            </div>
                          );
                          const node = item;
                          return (
                          <div key={i} className="flex flex-col items-center z-10 min-w-[64px] max-w-[96px]">
                            {/* Above circle */}
                            <div className="mb-1.5 text-center h-6 flex items-end justify-center">
                              {node.labelTop
                                ? <div className={`text-[10px] font-bold tracking-widest uppercase ${node.icon === 'drive' ? 'text-red-500' : 'text-slate-500'}`}>{node.label}</div>
                                : node.time
                                  ? <div className="text-xs font-semibold text-blue-600 whitespace-nowrap">{node.time}</div>
                                  : null}
                            </div>

                            {/* Circle */}
                            <div className={`h-9 w-9 rounded-full border-2 flex items-center justify-center shadow-sm bg-white shrink-0 ${node.icon === 'drive' ? 'border-red-400' : 'border-blue-400'}`}>
                              {node.icon === 'truck'    && <Truck size={15} className="text-blue-500" />}
                              {node.icon === 'dep'      && <Plane size={14} className="text-blue-500" />}
                              {node.icon === 'arr'      && <Plane size={14} className="text-blue-500 rotate-45" />}
                              {node.icon === 'connect'  && <RefreshCw size={13} className="text-blue-400" />}
                              {node.icon === 'drive'    && <Truck size={15} className="text-red-500" />}
                              {node.icon === 'delivery' && <PackageCheck size={15} className="text-blue-500" />}
                            </div>

                            {/* Below circle */}
                            <div className="mt-1.5 text-center">
                              {!node.labelTop && <div className={`text-[10px] font-bold tracking-widest uppercase ${node.icon === 'drive' ? 'text-red-500' : 'text-slate-400'}`}>{node.label}</div>}
                              {node.station  && <div className="text-sm font-bold text-slate-800 mt-0.5">{node.station}</div>}
                              {node.cityLine && <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">{node.cityLine}</div>}
                            </div>
                          </div>
                        );})}

                      </div>
                    </div>
                  );
                })()}
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

      {/* Edit Lane Mapping Name Modal */}
      {showEditNameModal && (
        <EditLaneMappingModal
          laneMappingId={laneMappingId}
          onClose={() => setShowEditNameModal(false)}
          onSuccess={handleEditNameSuccess}
        />
      )}

      {/* Create Lane Modal */}
      {showCreateLaneModal && (
        <CreateLaneModal
          laneMappingId={laneMappingId}
          onClose={() => setShowCreateLaneModal(false)}
          onCreated={newLane => {
            setLanes(prev => [...prev, { ...newLane, hasBeenUpdated: false }]);
            setError(null);
          }}
        />
      )}
    </div>
  );
};

export default LaneMappingLanes;
