import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllAccounts,
  allLaneCount,
  getAccountbyId,
  deleteAccountbyId,
  postAccountExcel,
} from '../api/api';

/**
 * Query Keys - Centralized for consistency
 * Using arrays allows for hierarchical keys and easy invalidation
 */
export const accountKeys = {
  all: ['accounts'],
  lists: () => [...accountKeys.all, 'list'],
  list: () => [...accountKeys.lists()],
  details: () => [...accountKeys.all, 'detail'],
  detail: id => [...accountKeys.details(), id],
  counts: () => [...accountKeys.all, 'counts'],
};

/**
 * Fetch all accounts with lane counts
 * Used in: Dashboard
 */
export function useAccounts() {
  return useQuery({
    queryKey: accountKeys.counts(),
    queryFn: allLaneCount,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch all accounts (basic list)
 * Used in: Accounts page
 */
export function useAccountsList() {
  return useQuery({
    queryKey: accountKeys.list(),
    queryFn: getAllAccounts,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch a single account by ID
 * Used in: AccountLanes, Edit
 */
export function useAccount(accountId) {
  return useQuery({
    queryKey: accountKeys.detail(accountId),
    queryFn: () => getAccountbyId(accountId),
    enabled: !!accountId, // Only fetch if accountId exists
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Delete an account
 * Automatically invalidates account queries on success
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAccountbyId,
    onSuccess: () => {
      // Invalidate all account queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
    onError: error => {
      console.error('Failed to delete account:', error);
    },
  });
}

/**
 * Upload Excel file to create/update accounts
 * Automatically invalidates account queries on success
 */
export function useUploadAccountExcel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postAccountExcel,
    onSuccess: () => {
      // Invalidate all account queries to show new data
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
    onError: error => {
      console.error('Failed to upload Excel:', error);
    },
  });
}
