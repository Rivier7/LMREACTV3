import { API_BASE_URL } from '../config/api';

// All endpoints now use /api prefix (backend updated)
const BASE_URL = `${API_BASE_URL}/lanes`;
const BASE_URL2 = `${API_BASE_URL}/laneMapping`;
const BASE_URL3 = `${API_BASE_URL}/flights/validate-leg`;

// ✅ Centralized headers function (always attaches JWT)
const getAuthHeaders = (isFormData = false) => {
  const token = localStorage.getItem('token');
  return isFormData
    ? { ...(token && { Authorization: `Bearer ${token}` }) }
    : {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
};

// ✅ Fetch all lanes
export const getLanes = async () => {
  const response = await fetch(BASE_URL, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to fetch lanes: ${response.status}`);
  return await response.json();
};

// ✅ Fetch lanes by account ID
export const getLanesByAccountId = async accountId => {
  const response = await fetch(`${BASE_URL}/account/${accountId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to fetch lanes for account ${accountId}`);
  return await response.json();
};

export const updateLane = async (id, updatedLane, legs) => {
  try {
    // Ensure laneMappingId is set on the lane for backend association
    const laneWithMapping = {
      ...updatedLane,
      laneMappingId: updatedLane.laneMappingId || updatedLane.laneMapping?.id,
    };

    const response = await fetch(`${BASE_URL}/updateLane/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ updatedLane: laneWithMapping, legs }),
    });

    // 304 Not Modified is uncommon for PUT, but handle if backend returns it
    if (response.status === 304) {
      return { notModified: true };
    }

    if (!response.ok) {
      // Try to parse error JSON, fallback to text
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || JSON.stringify(errorData);
      } catch {
        errorMessage = await response.text();
      }
      throw new Error(`Failed to update lane with ID ${id}: ${errorMessage}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateAllTatTime = async (id, updatedLane) => {
  const response = await fetch(`${BASE_URL2}/updateAllTatTime/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ updatedLane }),
  });
  if (!response.ok) throw new Error(`Failed to calculate TAT`);

  return await response.json();
};

// ✅ Get TAT for a lane
export const getTAT = async (updatedLane, legs) => {
  const response = await fetch(`${BASE_URL}/calculateTAT`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ updatedLane, legs }),
  });

  if (!response.ok) throw new Error(`Failed to calculate TAT`);

  const text = await response.text();
  return text;
};

export const updateLaneMappingLanes = async (id, updatedLanes) => {
  const response = await fetch(`${BASE_URL2}/updateLanes/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedLanes),
  });

  if (!response.ok) throw new Error(`Failed to update lanes for lane mapping with ID ${id}`);
  return await response.json();
};

// ✅ Update a lane
export const updateLaneToDirectDrive = async (id, updatedLane) => {
  const response = await fetch(`${BASE_URL}/updateLane/${id}/directdrive`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ lane: updatedLane }),
  });
  if (!response.ok) throw new Error(`Failed to update lane with ID ${id}`);
  return await response.json();
};

// ✅ Fetch all lane mappings
export const getAllLaneMappings = async () => {
  const response = await fetch(BASE_URL2, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to fetch lane mappings: ${response.status}`);
  return await response.json();
};

// ✅ fetch lane count
export const allLaneCount = async id => {
  const response = await fetch(`${BASE_URL2}/allLaneCount`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to fetch all lane count with ID ${id}`);
  return await response.json();
};
// ✅ fetch lane count
export const getLaneCounts = async () => {
  const response = await fetch(`${BASE_URL}/count`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to fetch all lane counts`);
  return await response.json();
};

// ✅ Get flights for a lane
export const getFlights = async id => {
  const response = await fetch(`${BASE_URL}/${id}/flights`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to fetch flights from lane with ID ${id}`);
  return await response.json();
};

// ✅ Download Excel for a lane mapping
export const getLaneMappingExcel = async id => {
  const response = await fetch(`${BASE_URL2}/${id}/Excel`, {
    headers: getAuthHeaders(),
  });

  const laneMapping = await getLaneMappingById(id);
  if (!response.ok) throw new Error(`Failed to fetch Excel for lane mapping ID ${id}`);

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${laneMapping.name} Lane-Mapping.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

// ✅ Download Excel template (generated by backend)
export const downloadExcelTemplate = async () => {
  const response = await fetch(`${BASE_URL2}/Excel-Template`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) throw new Error('Failed to download Excel template');

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  // Server uses filename "LM.xlsx" in Content-Disposition; fall back to LM.xlsx
  a.download = 'LM.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

/**
 * Upload an Excel file to create or update lane mappings.
 * @param {File|Blob} file - The Excel file to upload.
 * @returns {Promise<Object>} Parsed response from the server.
 * @throws {Error} Throws if the upload fails or the server returns an error.
 */
export const postLaneMappingExcel = async file => {
  if (!(file instanceof File || file instanceof Blob)) {
    throw new TypeError('Invalid file type. Expected File or Blob.');
  }

  const formData = new FormData();

  // Use original filename if available, otherwise provide a default
  const filename = file.name || 'upload.xlsx';
  formData.append('file', file, filename);

  const headers = getAuthHeaders(true);

  // IMPORTANT: Let fetch set Content-Type for FormData
  if (headers['Content-Type']) {
    delete headers['Content-Type'];
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const response = await fetch(`${BASE_URL2}/post-laneMapping_excel`, {
      method: 'POST',
      headers,
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 🔹 Handle non-2xx responses
    if (!response.ok) {
      let errorMessage = 'Upload failed';

      try {
        // Backend returns JSON error
        const errorJson = await response.json();
        errorMessage = errorJson.message || errorMessage;
      } catch {
        // Fallback if response is plain text
        const errorText = await response.text();
        if (errorText) {
          errorMessage = errorText;
        }
      }

      throw new Error(errorMessage);
    }

    // 🔹 Success response (backend returns plain text)
    const successText = await response.text();

    return {
      success: true,
      message: successText,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error('Upload timed out after 30 seconds');
    }

    // Re-throw backend or network error
    throw error;
  }
};

/**
 * Upload an Excel file with SSE progress tracking.
 * @param {File|Blob} file - The Excel file to upload.
 * @param {Function} onProgress - Callback for progress updates.
 * @param {Function} onError - Callback for error events.
 * @param {Function} onComplete - Callback when upload completes.
 * @returns {Promise<Object>} Final response data from the server.
 */
export const uploadExcelWithProgress = async (file, { onProgress, onError, onComplete }) => {
  if (!(file instanceof File || file instanceof Blob)) {
    throw new TypeError('Invalid file type. Expected File or Blob.');
  }

  const formData = new FormData();
  const filename = file.name || 'upload.xlsx';
  formData.append('file', file, filename);

  const token = localStorage.getItem('token');
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    Accept: 'text/event-stream',
  };

  try {
    const response = await fetch(`${BASE_URL2}/upload-with-progress`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Upload failed';
      try {
        const errorJson = await response.json();
        errorMessage = errorJson.message || errorMessage;
      } catch {
        const errorText = await response.text();
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let finalData = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse SSE format: "event: <type>\ndata: {...}\n\n"
      const events = buffer.split('\n\n');
      buffer = events.pop() || ''; // Keep incomplete event in buffer

      for (const eventBlock of events) {
        if (!eventBlock.trim()) continue;

        const lines = eventBlock.split('\n');
        let eventType = 'message';
        let dataLine = '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventType = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            dataLine = line.slice(5).trim();
          }
        }

        if (!dataLine) continue;

        try {
          const data = JSON.parse(dataLine);

          if (eventType === 'error' || data.status === 'error') {
            onError?.(data);
            throw new Error(data.message || 'Upload error');
          } else if (data.status === 'completed') {
            finalData = data;
            onComplete?.(data);
          } else {
            onProgress?.(data);
          }
        } catch (parseError) {
          if (parseError.message !== 'Upload error') {
            console.warn('Failed to parse SSE data:', dataLine, parseError);
          } else {
            throw parseError;
          }
        }
      }
    }

    return finalData || { success: true, message: 'Upload completed' };
  } catch (error) {
    throw error;
  }
};

// ✅ Get a single lane by ID
export const getLanebyId = async id => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to fetch lane with ID ${id}`);
  return await response.json();
};

// ✅ Get a single lane mapping by ID
export const getLaneMappingById = async id => {
  const response = await fetch(`${BASE_URL2}/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to fetch lane mapping with ID ${id}`);
  return await response.json();
};

export const getLanesByLaneMappingId = async id => {
  try {
    const response = await fetch(`${BASE_URL2}/${id}/lanes`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch lanes for lane mapping with ID ${id}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// ✅ Delete a lane mapping by ID
export const deleteLaneMappingById = async id => {
  const response = await fetch(`${BASE_URL2}/delete/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to delete lane mapping with ID ${id}`);
  return await response.json();
};

// ✅ Update lane mapping name
export const updateLaneMappingName = async (id, name) => {
  const response = await fetch(`${BASE_URL2}/${id}/name`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error(`Failed to update lane mapping name with ID ${id}`);
  return await response.json();
};


export const deleteLaneById = async id => {
  const response = await fetch(`${BASE_URL}/delete/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to delete lane with ID ${id}`);
  return await response.json();
}


// ✅ Validate a flight
export const validateFlight = async flight => {
  const response = await fetch(BASE_URL3, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(flight),
  });

  if (!response.ok) {
    // Read body as text first (can only read once)
    const errorText = await response.text();
    let errorMessage = errorText || 'Flight validation failed.';

    // Try to parse as JSON to extract message field
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorData.error || errorText;
    } catch {
      // Not JSON, use the raw text
    }

    throw new Error(errorMessage);
  }

  return await response.json();
};

export const validateLanes = async lanes => {
  const response = await fetch(`${BASE_URL}/validate-lanes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(lanes),
  });
  if (!response.ok) throw new Error('Lane validation failed.');
  return await response.json();
};

export const getSuggestedRoute = async payload => {
  const response = await fetch(`${BASE_URL}/suggestRoute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(localStorage.getItem('token') && {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      }),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    // Try to parse error message JSON from response body
    let errorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || JSON.stringify(errorData);
    } catch {
      errorMessage = await response.text();
    }
    throw new Error(errorMessage);
  }

  return await response.json();
};

// ✅ NEW: Get suggested route by location (city/state/country)
export const getSuggestedRouteByLocation = async payload => {
  const response = await fetch(`${BASE_URL}/suggestRouteByLocation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(localStorage.getItem('token') && {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      }),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    // Try to parse error message JSON from response body
    let errorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || JSON.stringify(errorData);
    } catch {
      errorMessage = await response.text();
    }
    throw new Error(errorMessage);
  }

  return await response.json();
};

// =====================
// Account API Functions
// =====================
const BASE_URL_ACCOUNT = `${API_BASE_URL}/account`;

// Get all accounts
export const getAllAccounts = async () => {
  const response = await fetch(BASE_URL_ACCOUNT, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to fetch accounts: ${response.status}`);
  return await response.json();
};

// Get account by ID (includes laneMappings)
export const getAccountById = async id => {
  const response = await fetch(`${BASE_URL_ACCOUNT}/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to fetch account with ID ${id}`);
  return await response.json();
};

// Create a new account
export const createAccount = async name => {
  const response = await fetch(BASE_URL_ACCOUNT, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error('Failed to create account');
  return await response.json();
};

// Update account name
export const updateAccount = async (id, name) => {
  const response = await fetch(`${BASE_URL_ACCOUNT}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error(`Failed to update account with ID ${id}`);
  return await response.json();
};

// Delete account (cascades to laneMappings)
export const deleteAccountById = async id => {
  const response = await fetch(`${BASE_URL_ACCOUNT}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to delete account with ID ${id}`);
  return await response.json();
};

// Assign a LaneMapping to an Account
export const assignLaneMappingToAccount = async (accountId, laneMappingId) => {
  const response = await fetch(`${BASE_URL_ACCOUNT}/${accountId}/laneMapping/${laneMappingId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to assign lane mapping ${laneMappingId} to account ${accountId}`);
  return await response.json();
};

// Remove a LaneMapping from an Account
export const removeLaneMappingFromAccount = async laneMappingId => {
  const response = await fetch(`${BASE_URL_ACCOUNT}/laneMapping/${laneMappingId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to remove lane mapping ${laneMappingId} from account`);
  return await response.json();
};

// Search flights between two airports
export const searchFlights = async (origin, destination) => {
  const response = await fetch(
    `${API_BASE_URL}/flights/search/airports/${encodeURIComponent(origin)}/to/${encodeURIComponent(destination)}`,
    { headers: getAuthHeaders() }
  );
  if (!response.ok) throw new Error(`No flights found from ${origin} to ${destination}`);
  return await response.json();
};
