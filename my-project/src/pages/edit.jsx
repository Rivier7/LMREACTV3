import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  updateLane,
  updateLaneToDirectDrive,
  getTAT,
  getFlights,
  validateFlight,
} from '../api/api';
import Header from '../components/Header';
import { getSuggestedRoute, getSuggestedRouteByLocation } from '../api/api';

const Edit = () => {
  const { laneId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const lane = location.state?.lane;

  const serviceLevels = [
    'DIRECT DRIVE',
    'LIFEGUARD',
    'LIFEGUARDXL',
    'QUICKPAK',
    'DASH CRITICAL',
    'DASH HEAVY',
    'EXPRESS HEAVY',
    'EK VITAL',
    'PPS',
    'EXPEDITEFS',
    'OTHER',
  ];

  if (!lane) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800 text-center">Error</h1>
          <p className="text-gray-600 mt-2 text-center">No lane data found</p>
        </div>
      </div>
    );
  }
  const [suggestedRoutes, setSuggestedRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(null);

  const [showSuggestedRoute, setShowSuggestedRoute] = useState(false);
  const [suggestError, setSuggestError] = useState(null);

  const [updatedLane, setUpdatedLane] = useState(lane);
  const [legs, setLegs] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadLegs = async () => {
      setIsLoading(true);
      try {
        const legData = await getFlights(lane.id);
        setLegs(legData);
      } catch (err) {
        console.error('Error loading legs:', err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadLegs();
  }, [lane.id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setUpdatedLane(prevLane => ({ ...prevLane, [name]: value }));
  };

  const handleSuggestRoute = async () => {
    try {
      setSuggestError(null);

      const payload = {
        itemNumber: updatedLane.itemNumber,
        originAirport: legs[0]?.originStation,
        destinationAirport: legs[legs.length - 1]?.destinationStation,
        collectionTime: updatedLane.pickUpTime,
      };

      const results = await getSuggestedRoute(payload);

      setSuggestedRoutes(results);
      setSelectedRouteIndex(null);
      setShowSuggestedRoute(true);
    } catch (error) {
      let message = 'Failed to suggest route.';
      if (error.message) message = error.message;
      else if (error.response) message = error.response.data?.error || message;

      setSuggestedRoutes([]);
      setSuggestError(message);
    }
  };

  const handleSuggestRouteByLocation = async () => {
    try {
      setSuggestError(null);

      const payload = {
        itemNumber: updatedLane.itemNumber,
        originCity: updatedLane.originCity,
        originState: updatedLane.originState,
        originCountry: updatedLane.originCountry,
        destinationCity: updatedLane.destinationCity,
        destinationState: updatedLane.destinationState,
        destinationCountry: updatedLane.destinationCountry,
        collectionTime: updatedLane.pickUpTime,
      };

      const results = await getSuggestedRouteByLocation(payload);

      setSuggestedRoutes(results);
      setSelectedRouteIndex(null);
      setShowSuggestedRoute(true);
    } catch (error) {
      let message = 'Failed to suggest route by location.';
      if (error.message) message = error.message;
      else if (error.response) message = error.response.data?.error || message;

      setSuggestedRoutes([]);
      setSuggestError(message);
    }
  };

  const handleInputChange = (index, field, rawValue) => {
    let value = rawValue.toUpperCase();

    if ((field === 'originStation' || field === 'destinationStation') && value.length > 3) {
      alert('Origin and destination must be max 3 letters.');
      return;
    }

    if (field === 'destinationStation') {
      const origin = legs[index]?.originStation?.toUpperCase();
      if (origin && value === origin) {
        alert('Origin and destination cannot be the same.');
        return;
      }

      const allOrigins = legs.map(leg => leg?.originStation?.toUpperCase()).filter(Boolean);

      if (allOrigins.includes(value)) {
        alert(`Destination '${value}' was already used as a departure airport.`);
        return;
      }
    }

    if (field === 'originStation') {
      const newOrigin = value.toUpperCase();
      const otherLegsOrigins = legs
        .map((leg, i) => (i !== index ? leg?.originStation?.toUpperCase() : null))
        .filter(Boolean);

      if (otherLegsOrigins.includes(newOrigin)) {
        alert(`Origin '${newOrigin}' is already used in another leg.`);
        return;
      }
    }

    if (field === 'flightNumber' && value.length >= 2) {
      value = value.substring(0, 2).toUpperCase() + value.substring(2);
    }

    const updatedLegs = [...legs];
    updatedLegs[index][field] = value;
    updatedLegs[index].valid = null;
    setLegs(updatedLegs);
  };

  const handleServiceLevelChange = (legIndex, serviceLevel) => {
    if (serviceLevel === 'DIRECT DRIVE') {
      const clearedLeg = {
        sequence: 1,
        flightNumber: null,
        departureTime: null,
        originStation: null,
        destinationStation: null,
        arrivalTime: null,
        flightOperatingdays: null,
        valid: null,
        serviceLevel: 'DIRECT DRIVE',
        cutoffTime: null,
        validMessage: [],
      };
      setLegs([clearedLeg]);
    } else {
      let updatedLegs = [...legs];
      if (updatedLegs.length === 0 || updatedLegs[0]?.serviceLevel === 'DIRECT DRIVE') {
        updatedLegs = [
          {
            sequence: 1,
            flightNumber: '',
            departureTime: '',
            originStation: '',
            destinationStation: '',
            arrivalTime: '',
            flightOperatingdays: '',
            valid: null,
            serviceLevel: '',
            cutoffTime: '',
            validMessage: [],
          },
        ];
      }

      const currentServiceLevel = updatedLegs[legIndex]?.serviceLevel;
      if (
        (serviceLevel === 'OTHER' && !serviceLevels.includes(currentServiceLevel)) ||
        currentServiceLevel === serviceLevel
      ) {
        updatedLegs[legIndex].serviceLevel = '';
      } else {
        updatedLegs[legIndex].serviceLevel = serviceLevel === 'OTHER' ? '' : serviceLevel;
      }
      setLegs(updatedLegs);
    }
  };

  const handleAddLeg = () => {
    if (legs.length >= 3) return;
    const maxSequence = legs.length > 0 ? Math.max(...legs.map(f => f.sequence || 0)) : 0;
    setLegs([
      ...legs,
      {
        sequence: maxSequence + 1,
        flightNumber: '',
        departureTime: '',
        originStation: '',
        destinationStation: '',
        arrivalTime: '',
        flightOperatingdays: '',
        valid: null,
        serviceLevel: '',
        cutoffTime: '',
        validMessage: [],
      },
    ]);
  };

  const handleRemoveLeg = () => {
    if (legs.length > 1) setLegs(prevLegs => prevLegs.slice(0, -1));
  };

  const handleValidateButton = async () => {
    setIsLoading(true);
    const updatedLegs = [...legs];
    for (const leg of updatedLegs) {
      try {
        const result = await validateFlight(leg);
        leg.valid = result.valid;
        leg.validMessage = result.mismatchedFields || [];
        leg.flightOperatingdays = result.operatingDays;
      } catch (error) {
        leg.valid = false;
        leg.validMessage = [error.message || 'Validation failed'];
      }
    }
    setLegs(updatedLegs);
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const isDirectDrive = legs[0]?.serviceLevel === 'DIRECT DRIVE';

    try {
      let result;
      if (isDirectDrive) {
        result = await updateLaneToDirectDrive(updatedLane.id, updatedLane, []);
      } else {
        if (legs.some(f => !f.flightNumber || !f.originStation || !f.destinationStation)) {
          alert('Please fill out all flight fields!');
          setIsLoading(false);
          return;
        }
        if (legs.some(f => f.valid === false || f.valid === null)) {
          alert('Not all legs are valid');
          setIsLoading(false);
          return;
        }
        console.log('Submitting updated lane with legs:', updatedLane, legs);

        result = await updateLane(updatedLane.id, updatedLane, legs);
      }

      if (result?.notModified) {
        alert('No changes detected — lane was not updated.');
      } else {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigate('/Lanes');
        }, 3000);
      }
    } catch (error) {
      console.error('Error updating lane:', error.message);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTATCalculation = async () => {
    setIsLoading(true);
    try {
      const tatTTime = await getTAT(updatedLane, legs);
      setUpdatedLane(prev => ({ ...prev, tatToConsigneeDuration: tatTTime }));
    } catch (error) {
      console.error('Error calculating TAT:', error.message);
      alert('Failed to calculate TAT.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyRoute = routePattern => {
    const updated = routePattern.legs
      .sort((a, b) => a.sequence - b.sequence)
      .map(leg => ({
        sequence: leg.sequence,
        flightNumber: leg.flightNumber,
        originStation: leg.originStation,
        destinationStation: leg.destinationStation,
        departureTime: leg.departureTime,
        arrivalTime: leg.arrivalTime,
        flightOperatingdays: leg.flightOperatingdays,
        serviceLevel: leg.serviceLevel || legs[0]?.serviceLevel || '',
        cutoffTime: leg.cutoffTime || legs[0]?.cutoffTime || '',
        valid: null,
        validMessage: [],
      }));
    setLegs(updated);
    setShowSuggestedRoute(false);
    setSuggestedRoutes([]);
    setSelectedRouteIndex(null);
  };

  const isDirectDriveSelected = legs[0]?.serviceLevel === 'DIRECT DRIVE';
  const hasFlightLegs = legs.length > 0 && legs[0]?.serviceLevel && !isDirectDriveSelected;

  return (
    <div className="min-h-screen bg-gray-50 text-sm">
      <Header />

      {/* Success Msg */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center">
            <div className="w-5 h-5 bg-gray-600 rounded-full mr-2 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            Lane updated successfully!
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-center">Processing...</p>
          </div>
        </div>
      )}

      <div className="w-full p-6 space-y-8">
        {/* Account Name */}
        <div className="bg-white rounded shadow border-gray-300 p-4 mb-4">
          <div className="text-center">
            <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs font-semibold text-gray-800">
              {updatedLane.accountName}
            </span>
            {updatedLane.lastUpdate && (
              <p className="text-xs text-gray-500 mt-1">Last Updated: {updatedLane.lastUpdate}</p>
            )}
          </div>
        </div>

        {/* ORIGIN / DESTINATION / LANE DETAILS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* ---------- ORIGIN ---------- */}
          <div className="bg-white p-3 rounded shadow border-gray-300">
            <div className="flex items-center mb-3">
              <div className="bg-gray-600 text-white p-2 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-xs text-gray-700 ml-2">Origin</h3>
            </div>

            {['City', 'State', 'Country'].map(field => (
              <div key={field} className="mb-3">
                <label className="block mb-1 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Origin {field}
                </label>
                <input
                  type="text"
                  name={`origin${field}`}
                  value={updatedLane[`origin${field}`] || ''}
                  onChange={handleChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                  placeholder={field}
                />
              </div>
            ))}
          </div>

          {/* ---------- DESTINATION ---------- */}
          <div className="bg-white p-3 rounded shadow border-gray-300">
            <div className="flex items-center mb-3">
              <div className="bg-gray-600 text-white p-2 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-xs text-gray-700 ml-2">Destination</h3>
            </div>

            {['City', 'State', 'Country'].map(field => (
              <div key={field} className="mb-3">
                <label className="block mb-1 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Destination {field}
                </label>
                <input
                  type="text"
                  name={`destination${field}`}
                  value={updatedLane[`destination${field}`] || ''}
                  onChange={handleChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                  placeholder={field}
                />
              </div>
            ))}
          </div>

          {/* ---------- LANE DETAILS ---------- */}
          <div className="bg-white p-3 rounded shadow border-gray-300">
            <div className="flex items-center mb-3">
              <div className="bg-gray-600 text-white p-2 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-xs text-gray-700 ml-2">Lane Details</h3>
            </div>

            <label className="block mb-1 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Item Number
            </label>
            <input
              type="text"
              name="itemNumber"
              value={updatedLane.itemNumber || ''}
              onChange={handleChange}
              className="w-full mb-3 px-2 py-1 border border-gray-300 rounded text-xs"
              placeholder="Item #"
            />

            <label className="block mb-1 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Lane Option
            </label>
            <input
              type="text"
              name="laneOption"
              value={updatedLane.laneOption || ''}
              onChange={handleChange}
              className="w-full mb-3 px-2 py-1 border border-gray-300 rounded text-xs"
              placeholder="Option"
            />

            <label className="block mb-1 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Pickup Time
            </label>
            <input
              type="text"
              name="pickUpTime"
              value={updatedLane.pickUpTime || ''}
              onChange={handleChange}
              className="w-full mb-3 px-2 py-1 border border-gray-300 rounded text-xs"
              placeholder="Pickup Time"
            />

            {hasFlightLegs && (
              <>
                <label className="block mb-1 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Cutoff Time
                </label>
                <input
                  type="text"
                  name="cutoffTime"
                  value={legs[0].cutoffTime || ''}
                  readOnly
                  className="w-full mb-2 px-2 py-1 border border-gray-300 rounded text-xs bg-gray-100 cursor-not-allowed"
                  placeholder="Cutoff Time"
                />
              </>
            )}
          </div>
        </div>

        {/* ---------- SERVICE LEVEL SECTION ---------- */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
          <h3 className="text-xs font-bold text-gray-800 mb-6 flex items-center">
            <div className="bg-gray-600 text-white p-2 rounded-lg mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            Service Level
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
            {serviceLevels.map((service, index) => {
              const isOther = service === 'OTHER';
              const currentService = legs[0]?.serviceLevel || '';
              const isChecked = isOther
                ? !serviceLevels.slice(0, -1).includes(currentService) && currentService !== ''
                : currentService === service;

              return (
                <div
                  key={index}
                  className={`flex flex-col p-2 rounded-lg border transition-all duration-200 ${isChecked ? 'border-gray-600 bg-gray-100 shadow-sm' : 'border-gray-200 bg-white'}`}
                >
                  <label
                    className="flex items-center cursor-pointer w-full"
                    onClick={() => handleServiceLevelChange(0, service)}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center flex-shrink-0 ${isChecked ? 'border-gray-600 bg-gray-600' : 'border-gray-300'}`}
                    >
                      {isChecked && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                    <span
                      className={`text-xs font-medium ${isChecked ? 'text-gray-700' : 'text-gray-600'}`}
                    >
                      {service}
                    </span>
                  </label>

                  {isOther && isChecked && (
                    <input
                      type="text"
                      value={currentService === 'OTHER' ? '' : currentService}
                      onChange={e => {
                        const updatedLegs = [...legs];
                        updatedLegs[0].serviceLevel = e.target.value.toUpperCase();
                        setLegs(updatedLegs);
                      }}
                      onClick={e => e.stopPropagation()}
                      placeholder="Specify service level"
                      className="mt-2 w-full px-2 py-1 border border-gray-300 rounded text-xs"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ---------- OVERALL ROUTE ---------- */}
        {hasFlightLegs && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 mb-4">
            <h3 className="text-xs font-bold text-gray-800 mb-4 flex items-center">
              <div className="bg-gray-600 text-white p-2 rounded-lg mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              Overall Route
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Origin Airport
                </label>
                <input
                  type="text"
                  value={legs[0]?.originStation || ''}
                  onChange={e => handleInputChange(0, 'originStation', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block mb-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Destination Airport
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={legs[legs.length - 1]?.destinationStation || ''}
                    onChange={e =>
                      handleInputChange(legs.length - 1, 'destinationStation', e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleSuggestRoute}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-semibold whitespace-nowrap"
                    title="Suggest route based on origin and destination airports"
                  >
                    Suggest by Airport
                  </button>
                  <button
                    type="button"
                    onClick={handleSuggestRouteByLocation}
                    className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-semibold whitespace-nowrap"
                    title="Suggest route based on origin and destination city/state/country"
                  >
                    Suggest by Location
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------- SUGGESTED ROUTES (TOP 3) ---------- */}
        {showSuggestedRoute && suggestedRoutes.length > 0 && (
          <div className="space-y-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800">Suggested Route Patterns (Top 3)</h3>
              <button
                type="button"
                onClick={() => {
                  setShowSuggestedRoute(false);
                  setSuggestedRoutes([]);
                  setSelectedRouteIndex(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {suggestedRoutes.map((routePattern, routeIndex) => (
                <div
                  key={routeIndex}
                  className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
                    selectedRouteIndex === routeIndex
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-blue-300 bg-white hover:border-blue-500'
                  }`}
                >
                  <div className="mb-3">
                    <p className="text-xs font-bold text-blue-900 mb-1">Option {routeIndex + 1}</p>
                    <p className="text-xs text-blue-700 font-semibold">
                      {routePattern.originStation} → {routePattern.destinationStation}
                    </p>
                  </div>

                  <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                    {routePattern.legs
                      .sort((a, b) => a.sequence - b.sequence)
                      .map((leg, i) => (
                        <div
                          key={i}
                          className="bg-gray-50 border border-gray-200 rounded p-2 text-xs"
                        >
                          <p className="font-semibold text-gray-700">
                            Leg {leg.sequence}: {leg.flightNumber}
                          </p>
                          <p className="text-gray-600">
                            {leg.originStation} → {leg.destinationStation}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {leg.departureTime} - {leg.arrivalTime}
                          </p>
                          <p className="text-gray-500 text-xs">Days: {leg.flightOperatingdays}</p>
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
                    className={`w-full px-3 py-2 rounded text-xs font-semibold transition-colors ${
                      selectedRouteIndex === routeIndex
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {selectedRouteIndex === routeIndex ? '✓ Apply This Route' : 'Select'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {suggestError && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{suggestError}</span>
          </div>
        )}

        {/* ---------- FLIGHT LEGS ---------- */}
        {hasFlightLegs && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <h3 className="text-xs font-bold text-gray-800 mb-6 flex items-center">
              <div className="bg-gray-600 text-white p-2 rounded-lg mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </div>
              Flight Legs
            </h3>

            <div className="space-y-6">
              {legs
                .slice()
                .sort((a, b) => a.sequence - b.sequence)
                .map((leg, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 items-start">
                      <div>
                        <label className="block mb-1 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          Flight Number
                        </label>
                        <input
                          type="text"
                          value={leg.flightNumber}
                          onChange={e => handleInputChange(index, 'flightNumber', e.target.value)}
                          className="text-xs px-3 py-2 border border-gray-300 rounded w-full"
                          placeholder="Flight Number"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          Departure Time
                        </label>
                        <input
                          type="text"
                          value={leg.departureTime}
                          onChange={e => handleInputChange(index, 'departureTime', e.target.value)}
                          className="text-xs px-3 py-2 border border-gray-300 rounded w-full"
                          placeholder="Departure"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          Origin Airport
                        </label>
                        <input
                          type="text"
                          value={leg.originStation}
                          onChange={e => handleInputChange(index, 'originStation', e.target.value)}
                          className="text-xs px-3 py-2 border border-gray-300 rounded w-full"
                          placeholder="Origin"
                        />
                      </div>

                      <div className="flex justify-center pt-6">
                        <div className="bg-gray-200 p-2 rounded">
                          <svg
                            className="w-6 h-6 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                          </svg>
                        </div>
                      </div>

                      <div>
                        <label className="block mb-1 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          Destination Airport
                        </label>
                        <input
                          type="text"
                          value={leg.destinationStation}
                          onChange={e =>
                            handleInputChange(index, 'destinationStation', e.target.value)
                          }
                          className="text-xs px-3 py-2 border border-gray-300 rounded w-full"
                          placeholder="Destination"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          Arrival Time
                        </label>
                        <input
                          type="text"
                          value={leg.arrivalTime}
                          onChange={e => handleInputChange(index, 'arrivalTime', e.target.value)}
                          className="text-xs px-3 py-2 border border-gray-300 rounded w-full"
                          placeholder="Arrival"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          Operating Days
                        </label>
                        <input
                          type="text"
                          value={leg.flightOperatingdays || ''}
                          onChange={e =>
                            handleInputChange(index, 'flightOperatingdays', e.target.value)
                          }
                          className="text-xs px-3 py-2 border border-gray-300 rounded w-full"
                          placeholder="Days"
                        />
                      </div>

                      <div>
                        {index === 0 && (
                          <>
                            <label className="block mb-1 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Cutoff Time
                            </label>
                            <input
                              type="text"
                              value={leg.cutoffTime || ''}
                              onChange={e => handleInputChange(index, 'cutoffTime', e.target.value)}
                              className="text-xs px-3 py-2 border border-gray-300 rounded w-full"
                              placeholder="Cutoff"
                            />
                          </>
                        )}
                      </div>
                    </div>

                    {/* VALIDATION BADGES */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center">
                        {leg.valid === true && (
                          <div className="flex items-center bg-green-100 px-3 py-1 rounded-full">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-green-700 font-medium text-sm">Valid</span>
                          </div>
                        )}
                        {leg.valid === false && (
                          <div className="flex items-center bg-red-100 px-3 py-1 rounded-full">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                            <span className="text-red-700 font-medium text-sm">Invalid</span>
                          </div>
                        )}
                        {leg.valid === null && (
                          <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                            <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                            <span className="text-gray-600 font-medium text-sm">Pending</span>
                          </div>
                        )}
                      </div>

                      {leg.validMessage && leg.validMessage.length > 0 && (
                        <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded">
                          {leg.validMessage.map((msg, i) => (
                            <div key={i}>{msg}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

              {/* BUTTONS: ADD / REMOVE / VALIDATE */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleRemoveLeg}
                  disabled={legs.length <= 1}
                  className="px-3 py-2 text-xs bg-gray-600 text-white rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Remove Leg
                </button>

                <button
                  onClick={handleAddLeg}
                  disabled={legs.length >= 3}
                  className="px-6 py-3 text-xs bg-gray-800 text-white rounded disabled:opacity-50 flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add Leg
                </button>

                <button
                  onClick={handleValidateButton}
                  className="px-6 py-3 text-xs bg-gray-700 text-white rounded flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Validate Legs
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------- ADDITIONAL INFO ---------- */}
        <div
          className={`bg-white rounded-lg shadow-lg border border-gray-200 p-4 ${isDirectDriveSelected ? 'mt-8' : ''}`}
        >
          <h3 className="text-xs font-bold text-gray-800 mb-6 flex items-center">
            <div className="bg-gray-600 text-white p-2 rounded-lg mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            Additional Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* CUSTOM CLEARANCE */}
            {hasFlightLegs && (
              <div>
                <label className="block mb-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Custom Clearance
                </label>
                <input
                  type="text"
                  name="customClearance"
                  value={updatedLane.customClearance || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Enter custom clearance"
                />
              </div>
            )}

            {/* DRIVE TIME */}
            <div>
              <label className="block mb-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Drive to Destination
              </label>
              <input
                type="text"
                name="driveToDestination"
                value={updatedLane.driveToDestination || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Enter drive time"
              />
            </div>

            {/* DELIVERY TIME */}
            <div>
              <label className="block mb-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Delivery Time Based on Receiving
              </label>
              <input
                type="text"
                name="actualDeliveryTimeBasedOnReceiving"
                value={updatedLane.actualDeliveryTimeBasedOnReceiving || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Enter delivery time"
              />
            </div>

            {/* TAT DURATION */}
            <div className="flex flex-col space-y-3">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                TAT to Consignee Duration
              </label>
              <input
                type="text"
                name="tatToConsigneeDuration"
                value={updatedLane.tatToConsigneeDuration || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Enter TAT duration"
              />

              <button
                type="button"
                onClick={handleTATCalculation}
                className="px-6 py-3 bg-gray-700 text-white rounded"
              >
                Calculate TAT
              </button>
            </div>
          </div>

          {/* NOTES */}
          <div className="mt-6">
            <label className="block mb-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Additional Notes
            </label>
            <textarea
              name="additionalNotes"
              value={updatedLane.additionalNotes || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="Enter additional notes"
            />
          </div>
        </div>

        {/* ---------- SUBMIT ---------- */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-8 py-2 bg-gray-800 text-white text-xs font-bold rounded flex items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Updating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Update Lane
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Edit;
