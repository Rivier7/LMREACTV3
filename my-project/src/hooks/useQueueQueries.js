import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQueueStatus, cancelValidationQueue, validateAllPendingLanes, revalidateAllLanes } from '../api/queue';
import { laneKeys } from './useLaneQueries';

/**
 * Query Keys - Centralized queue query keys
 */
export const queueKeys = {
  all: ['queue'],
  status: () => [...queueKeys.all, 'status'],
};

/**
 * Fetch validation queue status with automatic polling.
 * @param pollingInterval - Polling interval in ms, or false to disable polling
 * Used in: Sidebar QueueStatusIndicator
 */
export function useQueueStatus(pollingInterval = 5000) {
  return useQuery({
    queryKey: queueKeys.status(),
    queryFn: getQueueStatus,
    refetchInterval: pollingInterval, // Poll at specified interval (false to disable)
    staleTime: 0, // Always refetch when queried
    refetchOnWindowFocus: true,
  });
}

/**
 * Cancel the validation queue.
 * Clears all pending validations and resets lanes to PENDING status.
 * Invalidates queue status and lane queries on success.
 */
export function useCancelQueue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelValidationQueue,
    onSuccess: () => {
      // Invalidate queue status
      queryClient.invalidateQueries({ queryKey: queueKeys.status() });
      // Invalidate all lane queries (lists, counts, byLaneMapping, etc.)
      queryClient.invalidateQueries({ queryKey: laneKeys.all });
    },
  });
}

/**
 * Validate all pending lanes.
 * Queues all lanes with PENDING status for validation.
 * Invalidates queue status on success.
 */
export function useValidateAllPending() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: validateAllPendingLanes,
    onSuccess: () => {
      // Invalidate queue status (new lanes in queue)
      queryClient.invalidateQueries({ queryKey: queueKeys.status() });
      // Invalidate all lane queries (lists, counts, byLaneMapping, etc.)
      queryClient.invalidateQueries({ queryKey: laneKeys.all });
    },
  });
}

/**
 * Revalidate ALL lanes.
 * Resets all lanes to PENDING and queues them for validation.
 * Invalidates queue status and all lane queries on success.
 */
export function useRevalidateAll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revalidateAllLanes,
    onSuccess: () => {
      // Invalidate queue status (all lanes now in queue)
      queryClient.invalidateQueries({ queryKey: queueKeys.status() });
      // Invalidate all lane queries (all lanes changed to PENDING)
      queryClient.invalidateQueries({ queryKey: laneKeys.all });
    },
  });
}
