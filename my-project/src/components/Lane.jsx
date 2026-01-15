import { useNavigate } from 'react-router-dom';
import { Edit3, Plane, Truck, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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
  return entries.map(([day, aircraft]) => `${dayAbbreviations[day] || day}: ${aircraft}`).join(', ');
};

function Lane({ lane }) {
  const navigate = useNavigate();

  if (!lane) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
        <p className="text-gray-500 text-sm">No lane data provided.</p>
      </div>
    );
  }

  const editLane = lane => {
    navigate('/edit', { state: { lane } });
  };

  const isDirectDrive = lane.legs?.[0]?.serviceLevel === 'DIRECT DRIVE';
  const isValid = lane.valid === true;
  const hasLegs = lane.legs && lane.legs.length > 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Compact Header */}
      <div className={`px-4 py-2.5 border-b flex items-center justify-between ${isValid ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
        <div className="flex items-center gap-3">
          {isValid ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
          <span className="font-semibold text-gray-900">{lane.accountName}</span>

          {/* Info Pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-500">Item:</span>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">{lane.itemNumber}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-500">Option:</span>
            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-medium">{lane.laneOption}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-500">Service:</span>
            <span className={`px-2 py-0.5 rounded font-medium ${isDirectDrive ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
              {lane.legs?.[0]?.serviceLevel || 'N/A'}
            </span>
          </div>
        </div>
        <button
          onClick={() => editLane(lane)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          Edit
        </button>
      </div>

      <div className="p-4">
        {/* Route & Info Row */}
        <div className="flex items-center gap-6 mb-3">
          {/* Route */}
          <div className="flex items-center gap-2">
            <div className="text-center">
              <div className="font-bold text-gray-900">{lane.originStation || '---'}</div>
              <div className="text-xs text-gray-500">{lane.originCity}, {lane.originState}</div>
              <div className="text-xs text-gray-400">{lane.originCountry}</div>
            </div>
            <div className="flex items-center px-3">
              <div className="w-8 h-px bg-gray-300"></div>
              {isDirectDrive ? (
                <Truck className="w-4 h-4 text-amber-600 mx-1" />
              ) : (
                <Plane className="w-4 h-4 text-blue-500 mx-1" />
              )}
              <div className="w-8 h-px bg-gray-300"></div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900">{lane.destinationStation || '---'}</div>
              <div className="text-xs text-gray-500">{lane.destinationCity}, {lane.destinationState}</div>
              <div className="text-xs text-gray-400">{lane.destinationCountry}</div>
            </div>
          </div>

          {/* Key Info */}
          <div className="flex items-center gap-4 text-sm border-l border-gray-200 pl-6">
            <div>
              <span className="text-gray-500">Pickup:</span>
              <span className="ml-1 font-medium">{lane.pickUpTime || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-500">Cutoff:</span>
              <span className="ml-1 font-medium">{lane.legs?.[0]?.cutoffTime || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-500">TAT:</span>
              <span className="ml-1 font-medium">{lane.tatToConsigneeDuration || 'N/A'}</span>
            </div>
            {lane.additionalNotes && (
              <div className="text-xs px-2 py-1 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 max-w-xs truncate">
                {lane.additionalNotes}
              </div>
            )}
          </div>
        </div>

        {/* Flight Legs - Compact Table */}
        {hasLegs && !isDirectDrive && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Flight</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Route</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Dep</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Arr</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Aircraft</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Days</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {[...lane.legs]
                  .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
                  .filter(leg => leg.serviceLevel !== 'DIRECT DRIVE')
                  .map((leg, idx) => (
                    <tr key={leg.sequence || idx} className={`border-b border-gray-100 last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-3 py-2 font-medium text-gray-900">{leg.flightNumber}</td>
                      <td className="px-3 py-2 text-gray-700">{leg.originStation} → {leg.destinationStation}</td>
                      <td className="px-3 py-2 text-gray-600">{leg.departureTime}</td>
                      <td className="px-3 py-2 text-gray-600">{leg.arrivalTime}</td>
                      <td className="px-3 py-2 text-gray-600 text-xs" title={
                        leg.aircraftByDay
                          ? Object.entries(leg.aircraftByDay).map(([day, aircraft]) => `${day}: ${aircraft}`).join('\n')
                          : ''
                      }>{formatAircraftByDay(leg.aircraftByDay)}</td>
                      <td className="px-3 py-2 text-xs text-gray-500">{leg.flightOperatingdays || 'N/A'}</td>
                      <td className="px-3 py-2 text-center">
                        {leg.valid === true ? (
                          <CheckCircle className="w-4 h-4 text-green-500 inline-block" />
                        ) : leg.valid === false ? (
                          <XCircle className="w-4 h-4 text-red-500 inline-block" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-500 inline-block" />
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Direct Drive Notice - Compact */}
        {isDirectDrive && (
          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4" />
            <span>Direct Drive - Ground transportation only</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Lane;
