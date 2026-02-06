import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccountById,
  assignLaneMappingToAccount,
  removeLaneMappingFromAccount,
} from '../api/api';
import { laneMappingKeys } from './useLaneMappingQueries';

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
};

/**
 * Fetch all accounts
 * Used in: Accounts page
 */
export function useAccounts() {
  return useQuery({
    queryKey: accountKeys.list(),
    queryFn: getAllAccounts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch a single account by ID (includes laneMappings)
 * Used in: AccountDetail page
 */
export function useAccount(accountId) {
  return useQuery({
    queryKey: accountKeys.detail(accountId),
    queryFn: () => getAccountById(accountId),
    enabled: !!accountId, // Only fetch if accountId exists
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Create a new account
 * Automatically invalidates account queries on success
 */
export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
    onError: error => {
      console.error('Failed to create account:', error);
    },
  });
}

/**
 * Update an account
 * Automatically invalidates account queries on success
 */
export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }) => updateAccount(id, name),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
    },
    onError: error => {
      console.error('Failed to update account:', error);
    },
  });
}

/**
 * Delete an account
 * Automatically invalidates account queries on success
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAccountById,
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: accountKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
    },
    onError: error => {
      console.error('Failed to delete account:', error);
    },
  });
}

/**
 * Assign a LaneMapping to an Account
 * Invalidates both account and laneMapping queries
 */
export function useAssignLaneMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accountId, laneMappingId }) =>
      assignLaneMappingToAccount(accountId, laneMappingId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.detail(variables.accountId) });
      queryClient.invalidateQueries({ queryKey: laneMappingKeys.all });
    },
    onError: error => {
      console.error('Failed to assign lane mapping:', error);
    },
  });
}

/**
 * Remove a LaneMapping from an Account
 * Invalidates both account and laneMapping queries
 */
export function useRemoveLaneMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ laneMappingId, accountId }) =>
      removeLaneMappingFromAccount(laneMappingId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.detail(variables.accountId) });
      queryClient.invalidateQueries({ queryKey: laneMappingKeys.all });
    },
    onError: error => {
      console.error('Failed to remove lane mapping:', error);
    },
  });
}
