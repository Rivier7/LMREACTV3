import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Edit3,
  Plane,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Clock,
  Calendar,
  User,
  AlertTriangle,
  ClipboardCheck,
  PackageCheck,
  RefreshCw,
} from 'lucide-react';
import AircraftCategoryBadge from './AircraftCategoryBadge';
import NearbyAirportsDropdown from './NearbyAirportsDropdown';

function Lane({ lane, onDelete, onManualValidate }) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

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

  const validationStatus = lane.validationStatus || 'PENDING';

  const formatDateTime = val => {
    if (!val) return null;
    const d = new Date(val);
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  };

  const formatDate = val => {
    if (!val) return null;
    const d = new Date(val);
    return d.toLocaleDateString(undefined, { dateStyle: 'medium' });
  };
  const isPending = validationStatus === 'PENDING';
  const isValid = validationStatus === 'VALID';
  const isScheduleMismatch = validationStatus === 'SCHEDULE_MISMATCH';
  const laneMappingName =
    lane.laneMappingName || lane.laneMapping?.name || lane.laneMapping?.laneMappingName;
  const sheetName =
    lane.sheetName || lane.sheet || lane.worksheetName || lane.tabName || lane.sourceSheetName;

  const StatusIcon = isPending
    ? AlertCircle
    : isValid
      ? CheckCircle
      : isScheduleMismatch
        ? AlertTriangle
        : XCircle;
  const statusLabel = isPending
    ? 'Pending'
    : isValid
      ? 'Valid'
      : isScheduleMismatch
        ? 'Outdated Schedule'
        : 'Invalid';
  const statusClass = isPending
    ? 'border-amber-200 bg-amber-50 text-amber-700'
    : isValid
      ? 'border-green-200 bg-green-50 text-green-700'
      : isScheduleMismatch
        ? 'border-orange-200 bg-orange-50 text-orange-700'
        : 'border-red-200 bg-red-50 text-red-700';
  const option = lane.laneOption?.toLowerCase();
  const optionClass =
    option === 'primary'
      ? 'bg-green-100 border-green-400 text-green-600'
      : option === 'secondary'
        ? 'bg-amber-100 border-amber-400 text-amber-600'
        : option === 'alternative'
          ? 'bg-gray-100 border-gray-400 text-gray-500'
          : 'bg-gray-50 border-gray-300 text-gray-400';
  const optionValueClass =
    option === 'primary'
      ? 'text-green-800 font-bold'
      : option === 'secondary'
        ? 'text-amber-800 font-bold'
        : 'text-gray-700';
  const infoCards = [
    {
      label: 'Item',
      value: lane.itemNumber,
      cls: 'bg-gray-50 border-gray-200 text-gray-400',
      val: 'text-gray-700',
    },
    { label: 'Option', value: lane.laneOption, cls: optionClass, val: optionValueClass },
    {
      label: 'Pickup',
      value: lane.pickUpTime,
      cls: 'bg-gray-50 border-gray-200 text-gray-400',
      val: 'text-gray-700',
    },
    {
      label: 'Delivery',
      value: lane.actualDeliveryTimeBasedOnReceiving,
      cls: 'bg-gray-50 border-gray-200 text-gray-400',
      val: 'text-gray-700',
    },
    {
      label: 'TAT',
      value: lane.tatToConsigneeDuration,
      cls: 'bg-gray-50 border-gray-200 text-gray-400',
      val: 'text-gray-700 font-bold',
    },
  ];

  return (
    <div
      className={`bg-white rounded-xl border shadow-md transition-all overflow-hidden ${isExpanded ? 'border-slate-400 ring-1 ring-slate-100 border-l-4 border-l-slate-700' : 'border-gray-200 hover:border-gray-300 hover:border-l-4 hover:border-l-slate-300'} hover:shadow-lg`}
    >
      <div
        className="px-4 py-5 flex items-center gap-2 cursor-pointer"
        onClick={() => setIsExpanded(current => !current)}
      >
        <button
          type="button"
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label={isExpanded ? 'Collapse lane' : 'Expand lane'}
        >
          {isExpanded ? (
            <ChevronDown size={20} className="text-gray-500" />
          ) : (
            <ChevronRight size={20} className="text-gray-500" />
          )}
        </button>

        <div className="flex items-center gap-4 shrink-0">
          <div>
            <div className="text-lg font-bold text-slate-900 tracking-wide leading-none">
              {lane.originStation || '---'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 max-w-[90px] truncate">
              {[lane.originCity, lane.originState, lane.originCountry].filter(Boolean).join(', ') ||
                '---'}
            </div>
          </div>
          <div className="flex items-center gap-1.5 group">
            <div className="h-px w-5 bg-slate-300 group-hover:bg-slate-400 transition-colors" />
            <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-300 text-slate-600 flex items-center justify-center shadow-sm shrink-0 group-hover:bg-slate-200 group-hover:border-slate-500 transition-colors">
              {isDirectDrive ? <Truck size={12} /> : <Plane size={12} />}
            </div>
            <div className="h-px w-5 bg-slate-300 group-hover:bg-slate-400 transition-colors" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900 tracking-wide leading-none">
              {lane.destinationStation || '---'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 max-w-[90px] truncate">
              {[lane.destinationCity, lane.destinationState, lane.destinationCountry]
                .filter(Boolean)
                .join(', ') || '---'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {infoCards.map(({ label, value, cls, val }) => (
            <div key={label} className={`rounded-lg px-2 py-0.5 border shrink-0 ${cls}`}>
              <div className="text-[8px] uppercase tracking-wide leading-none">{label}</div>
              <div className={`text-[10px] mt-0.5 font-semibold leading-none ${val}`}>
                {value || '-'}
              </div>
            </div>
          ))}
        </div>

        <div className="min-w-0 flex flex-wrap items-center gap-1.5">
          {lane.accountName && (
            <span
              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium truncate max-w-[160px]"
              title={lane.accountName}
            >
              {lane.accountName}
            </span>
          )}
          {laneMappingName && (
            <span
              className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-xs font-medium truncate max-w-[180px]"
              title={laneMappingName}
            >
              LM: {laneMappingName}
            </span>
          )}
          {sheetName && (
            <span
              className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-xs font-medium truncate max-w-[160px]"
              title={sheetName}
            >
              Sheet: {sheetName}
            </span>
          )}
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
          <span
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${statusClass}`}
          >
            <StatusIcon size={12} />
            {statusLabel}
          </span>
          {onManualValidate && (
            <button
              onClick={() => onManualValidate(lane)}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors"
              title="Manual Validation"
            >
              <ClipboardCheck size={12} />
              Validate
            </button>
          )}
          <button
            onClick={() => editLane(lane)}
            className="p-1.5 rounded-lg transition-colors hover:bg-gray-100 text-gray-400 hover:text-slate-900"
            title="Edit Lane"
          >
            <Edit3 size={15} />
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(lane.id)}
              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-600"
              title="Delete this lane"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          {/* Route & Info Row */}
          <div className="flex items-center gap-6 mb-3">
            {/* Route */}
            <div className="flex items-center gap-2">
              <div className="text-center">
                <div className="font-bold text-gray-900">{lane.originStation || '---'}</div>
                <div className="text-xs text-gray-500">
                  {lane.originCity}, {lane.originState}
                </div>
                <div className="text-xs text-gray-400">{lane.originCountry}</div>
                <div className="mt-1">
                  <NearbyAirportsDropdown
                    city={lane.originCity}
                    state={lane.originState}
                    country={lane.originCountry}
                    label="Shipper"
                  />
                </div>
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
                <div className="text-xs text-gray-500">
                  {lane.destinationCity}, {lane.destinationState}
                </div>
                <div className="text-xs text-gray-400">{lane.destinationCountry}</div>
                <div className="mt-1">
                  <NearbyAirportsDropdown
                    city={lane.destinationCity}
                    state={lane.destinationState}
                    country={lane.destinationCountry}
                    label="Consignee"
                  />
                </div>
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
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                      Flight
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Route</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Dep</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Arr</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                      Operating Days
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...lane.legs]
                    .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
                    .map((leg, idx) => (
                      <tr
                        key={leg.sequence || idx}
                        className={`border-b border-gray-100 last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                      >
                        <td className="px-3 py-2 font-medium text-gray-900">{leg.flightNumber}</td>
                        <td className="px-3 py-2 text-gray-700">
                          {leg.originStation} → {leg.destinationStation}
                        </td>
                        <td className="px-3 py-2 text-gray-600">{leg.departureTime}</td>
                        <td className="px-3 py-2 text-gray-600">{leg.arrivalTime}</td>
                        <td className="px-3 py-2 text-gray-600 text-xs">
                          {leg.flightOperatingDays || 'N/A'}
                        </td>
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
                        {[
                          'MONDAY',
                          'TUESDAY',
                          'WEDNESDAY',
                          'THURSDAY',
                          'FRIDAY',
                          'SATURDAY',
                          'SUNDAY',
                        ].map(day => {
                          const aircraft = leg.aircraftByDay?.[day];
                          const category = leg.aircraftCategoryByDay?.[day];
                          const dayAbbr = {
                            MONDAY: 'Mon',
                            TUESDAY: 'Tue',
                            WEDNESDAY: 'Wed',
                            THURSDAY: 'Thu',
                            FRIDAY: 'Fri',
                            SATURDAY: 'Sat',
                            SUNDAY: 'Sun',
                          }[day];
                          return (
                            <div
                              key={day}
                              className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded"
                            >
                              <span className="text-xs font-medium text-gray-500">{dayAbbr}</span>
                              <span
                                className={`text-xs font-semibold ${aircraft ? 'text-gray-800' : 'text-gray-300'}`}
                              >
                                {aircraft || '-'}
                              </span>
                              {aircraft && category && (
                                <AircraftCategoryBadge category={category} size="xs" />
                              )}
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

          {/* Journey Visualization */}
          {(() => {
            const sortedLegs = hasLegs
              ? [...lane.legs].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
              : [];

            const originCity = [lane.originCity, lane.originState, lane.originCountry]
              .filter(Boolean)
              .join(', ');
            const destCity = [lane.destinationCity, lane.destinationState, lane.destinationCountry]
              .filter(Boolean)
              .join(', ');

            // Build flat items: alternating { type:'node' } and { type:'connector', flight? }
            const items = [];
            const addNode = n => items.push({ type: 'node', ...n });
            const addConn = (flight = null) => items.push({ type: 'connector', flight });

            addNode({
              icon: 'truck',
              label: 'PICKUP',
              labelTop: true,
              cityLine: originCity || lane.originStation,
            });

            if (isDirectDrive) {
              addConn();
              addNode({ icon: 'drive', label: 'DIRECT DRIVE', labelTop: true });
            } else if (sortedLegs.length > 0) {
              sortedLegs.forEach((leg, i) => {
                addConn();
                addNode({
                  time: leg.departureTime,
                  icon: 'dep',
                  label: 'ETD',
                  station: leg.originStation,
                });
                addConn(leg.flightNumber);
                const isLast = i === sortedLegs.length - 1;
                addNode({
                  time: leg.arrivalTime,
                  icon: isLast ? 'arr' : 'connect',
                  label: isLast ? 'ETA' : 'CONNECT',
                  station: leg.destinationStation,
                });
              });
            }
            addConn();
            addNode({
              time: lane.actualDeliveryTimeBasedOnReceiving,
              icon: 'delivery',
              label: 'DELIVERY',
              cityLine: destCity || lane.destinationStation,
            });

            return (
              <div className="mt-4 border-t-2 border-gray-200 bg-gray-50 rounded-b-lg overflow-hidden -mx-4 -mb-4">
                <div className="flex items-center px-4 py-4 w-full overflow-x-auto">
                  {items.map((item, i) => {
                    if (item.type === 'connector')
                      return (
                        <div
                          key={i}
                          className="flex-1 flex flex-col items-center gap-1 min-w-[40px]"
                        >
                          {item.flight ? (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 border border-blue-200 text-xs font-bold text-blue-700 whitespace-nowrap">
                              {item.flight}
                            </span>
                          ) : (
                            <div className="h-5" />
                          )}
                          <div className="w-full h-[3px] bg-blue-200 rounded-full" />
                        </div>
                      );
                    const node = item;
                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center z-10 min-w-[56px] max-w-[80px]"
                      >
                        {/* Above circle */}
                        <div className="mb-1 text-center h-5 flex items-end justify-center">
                          {node.labelTop ? (
                            <div
                              className={`text-[9px] font-bold tracking-wider uppercase ${node.icon === 'drive' ? 'text-red-500' : 'text-slate-500'}`}
                            >
                              {node.label}
                            </div>
                          ) : node.time ? (
                            <div className="text-[10px] font-semibold text-blue-600 whitespace-nowrap">
                              {node.time}
                            </div>
                          ) : null}
                        </div>

                        {/* Circle */}
                        <div
                          className={`h-8 w-8 rounded-full border-2 flex items-center justify-center shadow-sm bg-white shrink-0 ${node.icon === 'drive' ? 'border-red-400' : 'border-blue-400'}`}
                        >
                          {node.icon === 'truck' && <Truck size={14} className="text-blue-500" />}
                          {node.icon === 'dep' && <Plane size={12} className="text-blue-500" />}
                          {node.icon === 'arr' && (
                            <Plane size={12} className="text-blue-500 rotate-45" />
                          )}
                          {node.icon === 'connect' && (
                            <RefreshCw size={11} className="text-blue-400" />
                          )}
                          {node.icon === 'drive' && <Truck size={14} className="text-red-500" />}
                          {node.icon === 'delivery' && (
                            <PackageCheck size={14} className="text-blue-500" />
                          )}
                        </div>

                        {/* Below circle */}
                        <div className="mt-1 text-center">
                          {!node.labelTop && (
                            <div
                              className={`text-[9px] font-bold tracking-wider uppercase ${node.icon === 'drive' ? 'text-red-500' : 'text-slate-400'}`}
                            >
                              {node.label}
                            </div>
                          )}
                          {node.station && (
                            <div className="text-xs font-bold text-slate-800 mt-0.5">
                              {node.station}
                            </div>
                          )}
                          {node.cityLine && (
                            <div className="text-[10px] text-slate-500 mt-0.5 leading-tight truncate max-w-[80px]">
                              {node.cityLine}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Metadata Footer */}
          {(lane.lastValidatedAt ||
            lane.lastUpdate ||
            lane.lastUpdatedBy ||
            lane.validationSource === 'MANUAL') && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-500">
              {lane.validationSource === 'MANUAL' && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                  <User className="w-3 h-3" />
                  Manual Validation by {lane.manualValidatedBy || 'Unknown'}
                  {lane.manualValidationNote && (
                    <span className="ml-1 text-purple-500" title={lane.manualValidationNote}>
                      (Note)
                    </span>
                  )}
                </span>
              )}
              {lane.lastValidatedAt && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  Validated:{' '}
                  <span className="font-medium text-gray-700 ml-0.5">
                    {formatDateTime(lane.lastValidatedAt)}
                  </span>
                </span>
              )}
              {lane.lastUpdate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  Updated:{' '}
                  <span className="font-medium text-gray-700 ml-0.5">
                    {formatDate(lane.lastUpdate)}
                  </span>
                </span>
              )}
              {lane.lastUpdatedBy && (
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  By: <span className="font-medium text-gray-700 ml-0.5">{lane.lastUpdatedBy}</span>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Lane;
