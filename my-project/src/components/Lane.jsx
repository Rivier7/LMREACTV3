import { useNavigate } from 'react-router-dom';
import { Edit3, Plane, Truck, CheckCircle, XCircle, AlertCircle, Trash2 } from 'lucide-react';

function Lane({ lane, onDelete }) {
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

  const isDirectDrive = lane.serviceLevel === 'DIRECT DRIVE';
  const hasLegs = lane.legs && lane.legs.length > 0;

  // 3-state validation status with backward compatibility
  const validationStatus = lane.validationStatus || (lane.valid === true ? 'VALID' : lane.valid === false ? 'INVALID' : 'PENDING');
  const isPending = validationStatus === 'PENDING';
  const isValid = validationStatus === 'VALID';

  const headerBg = isPending
    ? 'bg-amber-50 border-amber-200'
    : isValid
      ? 'bg-green-50 border-green-100'
      : 'bg-red-50 border-red-100';

  const StatusIcon = isPending ? AlertCircle : isValid ? CheckCircle : XCircle;
  const statusIconColor = isPending ? 'text-amber-500' : isValid ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Compact Header */}
      <div className={`px-4 py-2.5 border-b flex items-center justify-between ${headerBg}`}>
        <div className="flex items-center gap-3">
          <StatusIcon className={`w-5 h-5 ${statusIconColor}`} />
          {isPending && (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
              Pending
            </span>
          )}
          <span className="font-semibold text-gray-900">{lane.accountName}</span>
          {lane.laneMappingName && (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
              {lane.laneMappingName}
            </span>
          )}

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
              {lane.serviceLevel || 'N/A'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => editLane(lane)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(lane.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
              title="Delete this lane"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          )}
        </div>
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
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Operating Days</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {[...lane.legs]
                  .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
                  .map((leg, idx) => (
                    <tr key={leg.sequence || idx} className={`border-b border-gray-100 last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-3 py-2 font-medium text-gray-900">{leg.flightNumber}</td>
                      <td className="px-3 py-2 text-gray-700">{leg.originStation} → {leg.destinationStation}</td>
                      <td className="px-3 py-2 text-gray-600">{leg.departureTime}</td>
                      <td className="px-3 py-2 text-gray-600">{leg.arrivalTime}</td>
                      <td className="px-3 py-2 text-gray-600 text-xs">{leg.flightOperatingDays || 'N/A'}</td>
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

            {/* Aircraft by Day */}
            <div className="px-4 py-3 bg-slate-50 border-t border-gray-200 space-y-3">
              {[...lane.legs]
                .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
                .map((leg, idx) => (
                  <div key={leg.sequence || idx}>
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      Aircraft by Day — {leg.flightNumber || `Leg ${idx + 1}`}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => {
                        const aircraft = leg.aircraftByDay?.[day];
                        const dayAbbr = { MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun' }[day];
                        return (
                          <div key={day} className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded">
                            <span className="text-xs font-medium text-gray-500">{dayAbbr}</span>
                            <span className={`text-xs font-semibold ${aircraft ? 'text-gray-800' : 'text-gray-300'}`}>
                              {aircraft || '-'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
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
