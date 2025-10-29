import React from 'react';
import { useNavigate } from 'react-router-dom';

function Lane({ lane }) {

  if (!lane) return (
    <div className="bg-gray-100 grid grid-cols-[1fr_2fr] rounded-xl border border-gray-300 min-w-[1100px] shadow-sm">
      <div className="p-4 flex items-center justify-center text-gray-500 text-sm">
        No lane data provided.
      </div>
    </div>
  );

  const navigate = useNavigate();

  const editLane = (lane) => {
    navigate('/edit', { state: { lane } });
  };

  return (
    <div className="bg-gray-100 grid grid-cols-[1fr_2fr] rounded-xl border border-gray-300 min-w-[1100px] shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Left Section */}
      <div className="bg-gray-100 p-4 space-y-4">
        {/* Header Section */}
        <div className="grid grid-cols-[2fr_1fr_1fr] gap-3 items-center">
          <h2 className="text-xs font-bold text-gray-800 truncate">{lane.accountName}</h2>
          <div className="text-center">
            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-semibold">
              {lane.laneOption}
            </span>
          </div>
          <div className="text-center">
            <span className="inline-block bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold">
              {lane.legs[0]?.serviceLevel || 'N/A'}
            </span>
          </div>
        </div>

        {/* Route Section */}
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
          <div className="flex flex-row gap-2 justify-center items-center text-gray-700">
            <div className="text-center">
              <div className="font-semibold text-gray-800 text-sm">{lane.originCity}</div>
              <div className="text-xs text-gray-600">{lane.originState}</div>
              <div className="text-xs text-gray-500">{lane.originCountry}</div>
            </div>
            <div className="flex-1 flex justify-center items-center px-2">
              <div className="w-full h-0.5 bg-gray-300 relative">
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-[8px] border-l-gray-400 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent"></div>
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-800 text-sm">{lane.destinationCity}</div>
              <div className="text-xs text-gray-600">{lane.destinationState}</div>
              <div className="text-xs text-gray-500">{lane.destinationCountry}</div>
            </div>
          </div>
        </div>

        {/* Timing Section */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200">
            <div className="text-xs text-gray-600 font-medium">Pickup Time</div>
            <div className="text-sm font-semibold text-gray-800">{lane.pickUpTime}</div>
          </div>
          <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200">
            <div className="text-xs text-gray-600 font-medium">Cutoff Time</div>
            <div className="text-sm font-semibold text-gray-800">{lane.legs[0]?.cutoffTime || 'N/A'}</div>
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="font-medium text-gray-700">Custom Clearance:</span>
              <span className="ml-1 text-gray-600">{lane.customClearance}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Drive to Destination:</span>
              <span className="ml-1 text-gray-600">{lane.driveToDestination}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="font-medium text-gray-700">Delivery Time:</span>
              <span className="ml-1 text-gray-600">{lane.actualDeliveryTimeBasedOnReceiving}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">TAT:</span>
              <span className="ml-1 text-gray-600">{lane.tatToConsigneeDuration}</span>
            </div>
          </div>
          {lane.additionalNotes && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 rounded-r-lg">
              <div className="text-xs text-gray-700">
                <span className="font-medium">Notes:</span> {lane.additionalNotes}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="bg-white flex flex-col p-4 space-y-3">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-800 mb-3 text-center">Flight Details</h3>

          {lane.legs && lane.legs.length > 0 ? (
            <div className="space-y-3">
              {[...lane.legs]
                .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
                .map((leg) =>
                  leg.serviceLevel === "DIRECT DRIVE" ? null : (
                    <div
                      className="grid grid-cols-7 items-center px-3 py-2 bg-gray-50 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                      key={leg.sequence}
                    >
                      <div className="text-center">
                        <div className="font-semibold text-gray-800 text-sm">{leg.flightNumber}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-800 text-sm">{leg.originStation}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-medium text-gray-700">{leg.departureTime}</div>
                      </div>

                      <div className="flex justify-center items-center">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center">

                          <img src="/public/plane.png" alt="Plane" />
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="font-medium text-gray-800 text-sm">{leg.destinationStation}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-medium text-gray-700">{leg.arrivalTime}</div>
                      </div>

                      <div className="flex justify-center items-center">
                        {leg.valid === true ? (
                          <div className="bg-green-400 w-4 h-4 rounded-full shadow-sm border border-green-500"></div>
                        ) : leg.valid === false ? (
                          <div className="bg-red-400 w-4 h-4 rounded-full shadow-sm border border-red-500"></div>
                        ) : (
                          <div className="bg-yellow-400 w-4 h-4 rounded-full shadow-sm border border-yellow-500"></div>
                        )}
                      </div>
                    </div>
                  )
                )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-6 text-gray-500">
              <div className="text-center">
                <svg className="mx-auto h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>


                <h5 className="text-sm">No legs available</h5>
              </div>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-gray-200">
          <button
            className="w-full bg-white text-blue-600 border-2 border-blue-600 rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer transition-all duration-300 hover:bg-blue-600 hover:text-white hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
            onClick={() => editLane(lane)}
          >
            Edit Lane
          </button>
        </div>
      </div>
    </div>
  );
}

export default Lane;
