import { API_BASE_URL } from '../config/api';

const BASE_URL = `${API_BASE_URL}/validation`;

// Centralized headers function (always attaches JWT)
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Gets the current validation queue status.
 * Returns pending/in-progress counts, estimated wait time, and affected lane mappings.
 */
export const getQueueStatus = async () => {
  const response = await fetch(`${BASE_URL}/queue-status`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to fetch queue status: ${response.status}`);
  return await response.json();
};

/**
 * Cancels all pending validations.
 * Clears the queue and resets affected lanes' validation status to PENDING.
 */
export const cancelValidationQueue = async () => {
  const response = await fetch(`${BASE_URL}/queue`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to cancel validation queue: ${response.status}`);
  return await response.json();
};

/**
 * Queues all lanes with PENDING validation status for validation.
 */
export const validateAllPendingLanes = async () => {
  const response = await fetch(`${BASE_URL}/validate-all-pending`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to queue pending lanes: ${response.status}`);
  return await response.json();
};
