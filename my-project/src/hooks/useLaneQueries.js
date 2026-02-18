import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLanes,
  getLanebyId,
  getLanesByLaneMappingId,
  getLanesByAccountId,
  getLaneCounts,
  getFlights,
  updateLane,
  updateLaneToDirectDrive,
  updateLaneMappingLanes,
  validateLanes,
  validateFlight,
  validateSingleLane,
  getSuggestedRoute,
  getSuggestedRouteByLocation,
  getTAT,
  updateAllTatTime,
} from '../api/api';

/**
 * Query Keys - Centralized lane query keys
 */
export const laneKeys = {
  all: ['lanes'],
  lists: () => [...laneKeys.all, 'list'],
  list: () => [...laneKeys.lists()],
  details: () => [...laneKeys.all, 'detail'],
  detail: id => [...laneKeys.details(), id],
  byLaneMapping: laneMappingId => [...laneKeys.all, 'laneMapping', laneMappingId],
  byAccount: accountId => [...laneKeys.all, 'account', accountId],
  counts: () => [...laneKeys.all, 'counts'],
  flights: laneId => [...laneKeys.all, 'flights', laneId],
};

/**
 * Fetch all lanes
 * Used in: AllLanes page
 */
export function useLanes() {
  return useQuery({
    queryKey: laneKeys.list(),
    queryFn: getLanes,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch lane counts (total, valid, invalid)
 * Used in: Dashboard
 */
export function useLaneCounts() {
  return useQuery({
    queryKey: laneKeys.counts(),
    queryFn: getLaneCounts,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch a single lane by ID
 * Used in: Edit page
 */
export function useLane(laneId) {
  return useQuery({
    queryKey: laneKeys.detail(laneId),
    queryFn: () => getLanebyId(laneId),
    enabled: !!laneId, // Only fetch if laneId exists
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch lanes for a specific lane mapping
 * Used in: LaneMappingLanes page
 */
export function useLanesByLaneMapping(laneMappingId) {
  return useQuery({
    queryKey: laneKeys.byLaneMapping(laneMappingId),
    queryFn: () => getLanesByLaneMappingId(laneMappingId),
    enabled: !!laneMappingId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch lanes for a specific account
 * Used in: AllLanes page with account filter
 */
export function useLanesByAccount(accountId) {
  return useQuery({
    queryKey: laneKeys.byAccount(accountId),
    queryFn: () => getLanesByAccountId(accountId),
    enabled: !!accountId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch flights for a specific lane
 * Used in: Edit page, Lane details
 */
export function useFlights(laneId) {
  return useQuery({
    queryKey: laneKeys.flights(laneId),
    queryFn: () => getFlights(laneId),
    enabled: !!laneId,
    staleTime: 2 * 60 * 1000, // 2 minutes (flights change more frequently)
  });
}

/**
 * Update a lane
 * Automatically invalidates related queries on success
 */
export function useUpdateLane() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updatedLane, legs }) => updateLane(id, updatedLane, legs),
    onSuccess: (data, variables) => {
      // Invalidate the specific lane
      queryClient.invalidateQueries({ queryKey: laneKeys.detail(variables.id) });
      // Invalidate lane lists
      queryClient.invalidateQueries({ queryKey: laneKeys.lists() });
      // Invalidate lane counts
      queryClient.invalidateQueries({ queryKey: laneKeys.counts() });
      // If this lane belongs to a lane mapping, invalidate that lane mapping's lanes
      if (variables.updatedLane?.laneMappingId) {
        queryClient.invalidateQueries({
          queryKey: laneKeys.byLaneMapping(variables.updatedLane.laneMappingId),
        });
      }
    },
  });
}

/**
 * Update lane to direct drive
 * Automatically invalidates related queries on success
 */
export function useUpdateLaneToDirectDrive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updatedLane }) => updateLaneToDirectDrive(id, updatedLane),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: laneKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: laneKeys.lists() });
      queryClient.invalidateQueries({ queryKey: laneKeys.counts() });
    },
  });
}

/**
 * Update multiple lanes for a lane mapping
 * Automatically invalidates lane mapping lanes on success
 */
export function useUpdateLaneMappingLanes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ laneMappingId, updatedLanes }) => updateLaneMappingLanes(laneMappingId, updatedLanes),
    onSuccess: (data, variables) => {
      // Invalidate lanes for this lane mapping
      queryClient.invalidateQueries({ queryKey: laneKeys.byLaneMapping(variables.laneMappingId) });
      // Invalidate lane counts
      queryClient.invalidateQueries({ queryKey: laneKeys.counts() });
    },
  });
}

/**
 * Update TAT time for all lanes in a lane mapping
 */
export function useUpdateAllTatTime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ laneMappingId, updatedLane }) => updateAllTatTime(laneMappingId, updatedLane),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: laneKeys.byLaneMapping(variables.laneMappingId) });
    },
  });
}

/**
 * Validate lanes
 * Note: This is a POST request but doesn't modify data, so we use useMutation
 * Could also be implemented as a regular query with parameters
 */
export function useValidateLanes() {
  return useMutation({
    mutationFn: validateLanes,
  });
}

/**
 * Validate a single flight
 */
export function useValidateFlight() {
  return useMutation({
    mutationFn: validateFlight,
  });
}

/**
 * Get suggested route by airport
 */
export function useGetSuggestedRoute() {
  return useMutation({
    mutationFn: getSuggestedRoute,
  });
}

/**
 * Get suggested route by location (city/state/country)
 */
export function useGetSuggestedRouteByLocation() {
  return useMutation({
    mutationFn: getSuggestedRouteByLocation,
  });
}

/**
 * Validate a single lane
 * Invalidates lane mapping lanes on success
 */
export function useValidateSingleLane() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: validateSingleLane,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: laneKeys.all });
    },
    onError: error => {
      console.error('Failed to validate lane:', error);
    },
  });
}

/**
 * Calculate TAT (Turn Around Time)
 */
export function useCalculateTAT() {
  return useMutation({
    mutationFn: ({ updatedLane, legs }) => getTAT(updatedLane, legs),
  });
}
