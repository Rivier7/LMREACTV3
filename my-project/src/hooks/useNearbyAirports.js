import { useMutation } from '@tanstack/react-query';
import { findNearbyAirports } from '../api/api';

/**
 * Query Keys - Centralized nearby airports query keys
 */
export const nearbyAirportsKeys = {
  all: ['nearbyAirports'],
  search: (city, state, country, radius) => [
    ...nearbyAirportsKeys.all,
    'search',
    { city, state, country, radius },
  ],
};

/**
 * Find nearby airports for a location
 * Returns mutation for on-demand airport search
 * Used in: Lane card expanded section (shipper/consignee dropdowns)
 */
export function useFindNearbyAirports() {
  return useMutation({
    mutationFn: payload => findNearbyAirports(payload),
  });
}
