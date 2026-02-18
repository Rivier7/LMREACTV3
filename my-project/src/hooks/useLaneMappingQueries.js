import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllLaneMappings,
  allLaneCount,
  getLaneMappingById,
  deleteLaneMappingById,
  postLaneMappingExcel,
  updateLaneMappingName,
  uploadDraftExcel,
  validateLaneMapping,
} from '../api/api';

/**
 * Query Keys - Centralized for consistency
 * Using arrays allows for hierarchical keys and easy invalidation
 */
export const laneMappingKeys = {
  all: ['laneMappings'],
  lists: () => [...laneMappingKeys.all, 'list'],
  list: () => [...laneMappingKeys.lists()],
  details: () => [...laneMappingKeys.all, 'detail'],
  detail: id => [...laneMappingKeys.details(), id],
  counts: () => [...laneMappingKeys.all, 'counts'],
};

/**
 * Fetch all lane mappings with lane counts
 * Used in: Dashboard
 */
export function useLaneMappings() {
  return useQuery({
    queryKey: laneMappingKeys.counts(),
    queryFn: allLaneCount,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch all lane mappings (basic list)
 * Used in: LaneMappings page
 */
export function useLaneMappingsList() {
  return useQuery({
    queryKey: laneMappingKeys.list(),
    queryFn: getAllLaneMappings,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch a single lane mapping by ID
 * Used in: LaneMappingLanes, Edit
 */
export function useLaneMapping(laneMappingId) {
  return useQuery({
    queryKey: laneMappingKeys.detail(laneMappingId),
    queryFn: () => getLaneMappingById(laneMappingId),
    enabled: !!laneMappingId, // Only fetch if laneMappingId exists
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Delete a lane mapping
 * Automatically invalidates lane mapping queries on success
 */
export function useDeleteLaneMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLaneMappingById,
    onSuccess: () => {
      // Invalidate all lane mapping queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: laneMappingKeys.all });
    },
    onError: error => {
      console.error('Failed to delete lane mapping:', error);
    },
  });
}

/**
 * Upload Excel file to create/update lane mappings
 * Automatically invalidates lane mapping queries on success
 */
export function useUploadLaneMappingExcel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postLaneMappingExcel,
    onSuccess: () => {
      // Invalidate all lane mapping queries to show new data
      queryClient.invalidateQueries({ queryKey: laneMappingKeys.all });
    },
    onError: error => {
      console.error('Failed to upload Excel:', error);
    },
  });
}

/**
 * Upload draft Excel file (no validation)
 * Automatically invalidates lane mapping queries on success
 */
export function useUploadDraftExcel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadDraftExcel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: laneMappingKeys.all });
    },
    onError: error => {
      console.error('Failed to upload draft Excel:', error);
    },
  });
}

/**
 * Validate all lanes in a lane mapping (bulk)
 * Automatically invalidates lane mapping queries on success
 */
export function useValidateLaneMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: validateLaneMapping,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: laneMappingKeys.all });
    },
    onError: error => {
      console.error('Failed to validate lane mapping:', error);
    },
  });
}

/**
 * Update lane mapping name
 * Automatically invalidates lane mapping queries on success
 */
export function useUpdateLaneMappingName() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }) => updateLaneMappingName(id, name),
    onSuccess: () => {
      // Invalidate all lane mapping queries to show updated name
      queryClient.invalidateQueries({ queryKey: laneMappingKeys.all });
    },
    onError: error => {
      console.error('Failed to update lane mapping name:', error);
    },
  });
}
