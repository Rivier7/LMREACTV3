import { useState, useRef, useEffect } from 'react';
import { MapPin, Loader2, ChevronDown, Plane, AlertCircle } from 'lucide-react';
import { useFindNearbyAirports } from '../hooks/useNearbyAirports';

function NearbyAirportsDropdown({ city, state, country, label, onSelect, align = 'left' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { mutate, data, isPending, isError, error, reset } = useFindNearbyAirports();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen && !data) {
      // First time opening - fetch airports
      mutate({ city, state, country, radiusMiles: 150 });
    }
    setIsOpen(!isOpen);
  };

  const handleExpandSearch = () => {
    const newRadius = data?.suggestedRadiusMiles || 300;
    mutate({ city, state, country, radiusMiles: newRadius });
  };

  const hasLocation = city && country;

  if (!hasLocation) {
    return null;
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        disabled={isPending}
        className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md transition-colors disabled:opacity-50"
        title={`Find airports near ${label}`}
      >
        {isPending ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <MapPin size={12} />
        )}
        <span>Nearby</span>
        <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute z-50 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg ${align === 'right' ? 'right-0' : 'left-0'}`}>
          <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-lg">
            <div className="text-xs font-medium text-gray-700">
              Airports near {label}
            </div>
            <div className="text-[10px] text-gray-500">
              {city}, {state ? `${state}, ` : ''}{country}
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {isPending && (
              <div className="flex items-center justify-center py-6 text-gray-500">
                <Loader2 size={20} className="animate-spin mr-2" />
                <span className="text-sm">Searching...</span>
              </div>
            )}

            {isError && (
              <div className="p-3 text-center">
                <AlertCircle size={20} className="text-red-500 mx-auto mb-2" />
                <div className="text-sm text-red-600">{error?.message || 'Failed to find airports'}</div>
                <button
                  onClick={() => mutate({ city, state, country, radiusMiles: 150 })}
                  className="mt-2 text-xs text-blue-600 hover:underline"
                >
                  Try again
                </button>
              </div>
            )}

            {data && !isPending && (
              <>
                {data.airports.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <Plane size={24} className="mx-auto mb-2 text-gray-300" />
                    <div className="text-sm">No airports found within {data.searchParams.radiusMiles} miles</div>
                    {data.suggestedRadiusMiles && (
                      <button
                        onClick={handleExpandSearch}
                        className="mt-2 text-xs text-blue-600 hover:underline"
                      >
                        Expand search to {data.suggestedRadiusMiles} miles
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {data.airports.map((airport, idx) => {
                      // Get display code: prefer IATA, fallback to ICAO with K-prefix stripped
                      const getDisplayCode = () => {
                        // Use IATA code if available
                        if (airport.iataCode) return airport.iataCode;

                        // Fallback: strip K prefix from ICAO code for US airports
                        const icao = airport.icaoCode || airport.airportCode;
                        if (icao && icao.startsWith('K') && icao.length === 4) {
                          return icao.substring(1);
                        }
                        return icao;
                      };

                      const displayCode = getDisplayCode();
                      const handleSelect = () => {
                        if (onSelect) {
                          onSelect(displayCode);
                          setIsOpen(false);
                        }
                      };

                      return (
                      <div
                        key={airport.airportCode || idx}
                        onClick={handleSelect}
                        className={`px-3 py-2 hover:bg-blue-50 cursor-pointer ${idx !== data.airports.length - 1 ? 'border-b border-gray-100' : ''} ${onSelect ? 'hover:bg-blue-50' : 'hover:bg-gray-50'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm text-gray-900">
                              {displayCode}
                            </div>
                            <div className="text-xs text-gray-600 truncate" title={airport.name}>
                              {airport.name}
                            </div>
                          </div>
                          <div className="text-right ml-2 shrink-0">
                            <div className="text-sm font-semibold text-blue-600">
                              {Math.round(airport.distanceMiles)} mi
                            </div>
                          </div>
                        </div>
                      </div>
                      );
                    })}

                    {data.totalFound > data.airports.length && (
                      <div className="px-3 py-2 text-center text-xs text-gray-500 bg-gray-50 border-t border-gray-100">
                        Showing top {data.airports.length} of {data.totalFound} airports
                      </div>
                    )}

                    {data.suggestedRadiusMiles && (
                      <div className="px-3 py-2 text-center border-t border-gray-100">
                        <button
                          onClick={handleExpandSearch}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Expand search to {data.suggestedRadiusMiles} miles
                        </button>
                      </div>
                    )}
                  </>
                )}

                <div className="px-3 py-1.5 text-[10px] text-gray-400 bg-gray-50 border-t border-gray-100 rounded-b-lg">
                  {data.fromCache ? 'Cached result' : 'Fresh result'} • {data.searchParams.radiusMiles} mile radius
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NearbyAirportsDropdown;
