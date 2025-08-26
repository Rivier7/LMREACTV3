import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { updateLane, updateLaneToDirectDrive, getTAT, getFlights, validateFlight } from '../api/api';
import Header from '../components/Header';

const Edit = () => {
  const { laneId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const lane = location.state?.lane;

  const serviceLevels = [
    'DIRECT DRIVE', 'LIFEGUARD', 'LIFEGUARDXL', 'QUICKPAK',
    'DASH CRITICAL', 'DASH HEAVY', 'EXPRESS HEAVY',
    'EK VITAL', 'PPS', 'EXPEDITEFS', 'OTHER',
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedLane((prevLane) => ({ ...prevLane, [name]: value }));
  };

  const handleInputChange = (index, field, value) => {
    const updatedLegs = [...legs];
    updatedLegs[index][field] = value;
    updatedLegs[index].valid = null;
    setLegs(updatedLegs);
  };

  const handleServiceLevelChange = (legIndex, serviceLevel) => {
    const updatedLegs = [...legs];
    if (updatedLegs[legIndex]?.serviceLevel === serviceLevel) {
      updatedLegs[legIndex].serviceLevel = '';
    } else {
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
        updatedLegs[legIndex].serviceLevel = serviceLevel;
        setLegs(updatedLegs);
      }
    }
  };

  const handleAddLeg = () => {
    if (legs.length >= 3) return;
    const maxSequence = legs.length > 0 ? Math.max(...legs.map((f) => f.sequence || 0)) : 0;
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
    setLegs((prevLegs) => prevLegs.slice(0, -1));
  };

  const handleValidateButton = async () => {
    setIsLoading(true);
    const updatedLegs = [...legs];
    for (const leg of updatedLegs) {
      const result = await validateFlight(leg);
      leg.valid = result.valid;
      leg.validMessage = result.mismatchedFields;
      leg.flightOperatingdays = result.operatingDays;

    }
    setLegs(updatedLegs);
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const isDirectDrive = legs[0]?.serviceLevel === 'DIRECT DRIVE';

    try {
      if (isDirectDrive) {
        await updateLaneToDirectDrive(updatedLane.id, updatedLane, []);
      } else {
        if (legs.some((f) => !f.flightNumber || !f.originStation || !f.destinationStation)) {
          alert('Please fill out all flight fields!');
          setIsLoading(false);
          return;
        }
        if (legs.some((f) => f.valid === false || f.valid === null)) {
          alert('Not all legs are valid');
          setIsLoading(false);
          return;
        }
        await updateLane(updatedLane.id, updatedLane, legs);
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/Lanes');
      }, 3000);
    } catch (error) {
      console.error('Error updating lane:', error.message);
      alert('Failed to update lane.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleTATCalculation = async () => {
    setIsLoading(true);
    try {
      const tatTTime = await getTAT(updatedLane, legs);
      setUpdatedLane((prev) => ({ ...prev, tatToConsigneeDuration: tatTTime }));
      setIsLoading(false);
      console.log('TAT Time:', tatTTime);
    } catch (error) {
      console.error('Error calculating TAT:', error.message);
      alert('Failed to calculate TAT.');
    } finally {
      setIsLoading(false);
    }
  };

  const isDirectDriveSelected = legs[0]?.serviceLevel === 'DIRECT DRIVE';
  const hasServiceLevel = legs.length > 0 && legs[0]?.serviceLevel !== '' && !isDirectDriveSelected;

  return (
    <div className="min-h-screen bg-gray-50 text-sm">
      <Header />

      {/* Success Message */}
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

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-center">Processing...</p>
          </div>
        </div>
      )}

      <div className="w-full p-6 space-y-8"
      >
        {/* Header Card */}
        <div className="bg-white rounded shadow border-gray-300 p-4 mb-4">
          <div className="text-center">
            <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs font-semibold text-gray-800">
              {updatedLane.accountName}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Origin */}
          <div className="bg-white p-3 rounded shadow border-gray-300">
            <div className="flex items-center mb-3">
              <div className="bg-gray-600 text-white p-2 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <h3 className="font-bold text-xs text-gray-700 ml-2">Origin</h3>
            </div>
            {['City', 'State', 'Country'].map((field, idx) => (
              <input
                key={idx}
                type="text"
                name={`origin${field}`}
                value={updatedLane[`origin${field}`] || ''}
                onChange={handleChange}
                className="w-full mb-2 px-2 py-1 border border-gray-300 rounded text-xs"
                placeholder={field}
              />
            ))}
          </div>

          {/* Destination */}
          <div className="bg-white p-3 rounded shadow border-gray-300">
            <div className="flex items-center mb-3">
              <div className="bg-gray-600 text-white p-2 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-xs text-gray-700 ml-2">Destination</h3>
            </div>
            {['City', 'State', 'Country'].map((field, idx) => (
              <input
                key={idx}
                type="text"
                name={`destination${field}`}
                value={updatedLane[`destination${field}`] || ''}
                onChange={handleChange}
                className="w-full mb-2 px-2 py-1 border border-gray-300 rounded text-xs"
                placeholder={field}
              />
            ))}
          </div>

          {/* Lane Details */}
          <div className="bg-white p-3 rounded shadow border-gray-300">
            <div className="flex items-center mb-3">
              <div className="bg-gray-600 text-white p-2 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-xs text-gray-700 ml-2">Lane Details</h3>
            </div>
            <input
              type="text"
              name="itemNumber"
              value={updatedLane.itemNumber || ''}
              onChange={handleChange}
              className="w-full mb-2 px-2 py-1 border border-gray-300 rounded text-xs"
              placeholder="Item #"
            />
            <input
              type="text"
              name="laneOption"
              value={updatedLane.laneOption || ''}
              onChange={handleChange}
              className="w-full mb-2 px-2 py-1 border border-gray-300 rounded text-xs"
              placeholder="Option"
            />
            <input
              type="text"
              name="pickUpTime"
              value={updatedLane.pickUpTime || ''}
              onChange={handleChange}
              className="w-full mb-2 px-2 py-1 border border-gray-300 rounded text-xs"
              placeholder="Pickup Time"
            />
            {hasServiceLevel && (
              <input
                type="text"
                name="cutoffTime"
                value={legs[0].cutoffTime || ''}
                onChange={(e) => handleInputChange(0, 'cutoffTime', e.target.value)}
                className="w-full mb-2 px-2 py-1 border border-gray-300 rounded text-xs"
                placeholder="Cutoff Time"
              />
            )}
          </div>
        </div>

        { }
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
          <h3 className="text-xs font-bold text-gray-800 mb-6 flex items-center">
            <div className="bg-gray-600 text-white p-2 rounded-lg mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            Service Level
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {serviceLevels.map((service, index) => (
              <label
                key={index}
                className={`flex items-center p-2 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${legs[0]?.serviceLevel === service
                  ? 'border-gray-600 bg-gray-100 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50'
                  }`}
              >
                <input
                  type="radio"
                  name="serviceLevel"
                  value={service}
                  checked={legs[0]?.serviceLevel === service}
                  onChange={(e) => handleServiceLevelChange(0, e.target.value)}
                  className="w-5 h-5 text-gray-600 sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${legs[0]?.serviceLevel === service ? 'border-gray-600 bg-gray-600' : 'border-gray-300'
                  }`}>
                  {legs[0]?.serviceLevel === service && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span className={`text-xs font-medium ${legs[0]?.serviceLevel === service ? 'text-gray-700' : 'text-gray-600'
                  }`}>
                  {service}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Flight Legs Card */}
        {hasServiceLevel && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <h3 className="text-xs font-bold text-gray-800 mb-6 flex items-center">
              <div className="bg-gray-600 text-white p-2 rounded-lg mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              Flight Legs
            </h3>
            <div className="space-y-6">
              {legs
                .slice()
                .sort((a, b) => a.sequence - b.sequence)
                .map((leg, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow duration-200"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 items-center">
                      <input
                        type="text"
                        placeholder="Flight #"
                        value={leg.flightNumber}
                        onChange={(e) => handleInputChange(index, 'flightNumber', e.target.value)}
                        className="text-xs px-3 py-2 border border-gray-300 rounded focus:border-gray-500 focus:outline-none transition-all duration-200"
                      />
                      <input
                        type="text"
                        placeholder="Departure"
                        value={leg.departureTime}
                        onChange={(e) => handleInputChange(index, 'departureTime', e.target.value)}
                        className="text-xs px-3 py-2 border border-gray-300 rounded focus:border-gray-500 focus:outline-none transition-all duration-200"
                      />
                      <input
                        type="text"
                        placeholder="Origin"
                        value={leg.originStation}
                        onChange={(e) => handleInputChange(index, 'originStation', e.target.value)}
                        className="text-xs px-3 py-2 border border-gray-300 rounded focus:border-gray-500 focus:outline-none transition-all duration-200"
                      />
                      <div className="flex justify-center">
                        <div className="bg-gray-200 p-2 rounded">
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="Destination"
                        value={leg.destinationStation}
                        onChange={(e) => handleInputChange(index, 'destinationStation', e.target.value)}
                        className="text-xs px-3 py-2 border border-gray-300 rounded focus:border-gray-500 focus:outline-none transition-all duration-200"
                      />
                      <input
                        type="text"
                        placeholder="Arrival"
                        value={leg.arrivalTime}
                        onChange={(e) => handleInputChange(index, 'arrivalTime', e.target.value)}
                        className="text-xs px-3 py-2 border border-gray-300 rounded focus:border-gray-500 focus:outline-none transition-all duration-200"
                      />
                      <input
                        type="text"
                        placeholder="Days"
                        value={leg.flightOperatingdays || ''}
                        onChange={(e) => handleInputChange(index, 'flightOperatingdays', e.target.value)}
                        className="text-xs px-3 py-2 border border-gray-300 rounded focus:border-gray-500 focus:outline-none transition-all duration-200"
                      />

                    </div>
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
                          {leg.validMessage.map((msg, idx) => (
                            <div key={idx}>{msg}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleRemoveLeg}
                  className="px-3 py-2 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-200 shadow hover:shadow-md flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove Leg
                </button>
                <button
                  onClick={handleAddLeg}
                  disabled={legs.length >= 3}
                  className="px-6 py-3 text-xs bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors duration-200 shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Leg
                </button>
                <button
                  onClick={handleValidateButton}
                  className="px-6 py-3 text-xs bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors duration-200 shadow hover:shadow-md flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Validate Legs
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Additional Fields Card */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <h3 className="text-xs font-bold text-gray-800 mb-6 flex items-center">
            <div className="bg-gray-600 text-white p-2 rounded-lg mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Additional Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hasServiceLevel && (
              <div>
                <label className="block mb-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Custom Clearance
                </label>
                <input
                  type="text"
                  name="customClearance"
                  value={updatedLane.customClearance || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-gray-500 focus:outline-none transition-all duration-200"
                  placeholder="Enter custom clearance"
                />
              </div>
            )}
            <div>
              <label className="block mb-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Drive to Destination
              </label>
              <input
                type="text"
                name="driveToDestination"
                value={updatedLane.driveToDestination || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-gray-500 focus:outline-none transition-all duration-200"
                placeholder="Enter drive time"
              />
            </div>
            <div>
              <label className="block mb-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Delivery Time Based On Receiving
              </label>
              <input
                type="text"
                name="actualDeliveryTimeBasedOnReceiving"
                value={updatedLane.actualDeliveryTimeBasedOnReceiving || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-gray-500 focus:outline-none transition-all duration-200"
                placeholder="Enter delivery time"
              />
            </div>
            <div className="flex flex-col space-y-3">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                TAT to Consignee Duration
              </label>

              <input
                type="text"
                name="tatToConsigneeDuration"
                value={updatedLane.tatToConsigneeDuration || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200"
                placeholder="Enter TAT duration"
              />

              <div>
                <button
                  type="button"
                  className="px-6 py-3 bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors duration-200 shadow hover:shadow-md flex items-center"
                  onClick={handleTATCalculation}
                >
                  Calculate TAT
                </button>
              </div>
            </div>


          </div>

          {/* Additional Notes */}
          <div>
            <label className="block mb-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Additional Notes
            </label>
            <textarea
              name="additionalNotes"
              value={updatedLane.additionalNotes || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-gray-500 focus:outline-none transition-all duration-200"
              placeholder="Enter additional notes"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-8 py-2 bg-gray-800 text-white text-xs font-bold rounded hover:bg-gray-900 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Updating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
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