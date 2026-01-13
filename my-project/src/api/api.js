import { FlipHorizontal } from 'lucide-react';

// Use environment variable for API base URL
const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8080';

const BASE_URL = `${API_BASE}/lanes`;
const BASE_URL2 = `${API_BASE}/Account`;
const BASE_URL3 = `${API_BASE}/api/flights/validate-leg`;

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

export const updateLane = async (id, updatedLane, legs) => {
  console.log('lane: ', updatedLane, legs);
  try {
    const response = await fetch(`${BASE_URL}/updateLane/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ updatedLane, legs }),
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
    // Consider integrating with your app's logging or error reporting system here
    console.error(`Error updating lane with ID ${id}:`, error);
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
  console.log(text);

  return text;
};

export const updateAccountLanes = async (id, updatedLanes) => {
  const response = await fetch(`${BASE_URL2}/updateLanes/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedLanes),
  });

  if (!response.ok) throw new Error(`Failed to update lanes for account with ID ${id}`);
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

// ✅ Fetch all accounts
export const getAllAccounts = async () => {
  const response = await fetch(BASE_URL2, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to fetch accounts: ${response.status}`);
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

// ✅ Download Excel for an account
export const getAccountExcel = async id => {
  const response = await fetch(`${BASE_URL2}/${id}/Excel`, {
    headers: getAuthHeaders(),
  });

  const account = await getAccountbyId(id);
  if (!response.ok) throw new Error(`Failed to fetch Excel for account ID ${id}`);

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${account.name} Lane-Mapping.xlsx`;
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
 * Upload an Excel file to create or update accounts.
 * @param {File|Blob} file - The Excel file to upload.
 * @returns {Promise<Object>} Parsed response from the server.
 * @throws {Error} Throws if the upload fails or the server returns an error.
 */
export const postAccountExcel = async file => {
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
    const response = await fetch(`${BASE_URL2}/post-account_excel`, {
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

// ✅ Get a single lane by ID
export const getLanebyId = async id => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to fetch lane with ID ${id}`);
  return await response.json();
};

// ✅ Get a single account by ID
export const getAccountbyId = async id => {
  const response = await fetch(`${BASE_URL2}/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to fetch account with ID ${id}`);
  return await response.json();
};

export const getLaneByAccountId = async id => {
  try {
    const response = await fetch(`${BASE_URL2}/${id}/lanes`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      console.error('Response status:', response.status);
      console.error('Response headers:', response.headers);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch lanes for account with ID ${id}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getLaneByAccountId:', error);
    throw error;
  }
};

// ✅ Delete an account by ID
export const deleteAccountbyId = async id => {
  const response = await fetch(`${BASE_URL2}/delete/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to delete account with ID ${id}`);
  return await response.json();
};

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
      console.log('Error data:', errorData);
    } catch {
      // Not JSON, use the raw text
      console.log('Error text:', errorText);
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
      console.log('Error data:', errorData);
      errorMessage = errorData.message || JSON.stringify(errorData);
    } catch {
      errorMessage = await response.text();
    }
    console.error('Error response:', errorMessage);
    throw new Error(` ${errorMessage}`);
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
      console.log('Error data:', errorData);
      errorMessage = errorData.message || JSON.stringify(errorData);
    } catch {
      errorMessage = await response.text();
    }
    console.error('Error response:', errorMessage);
    throw new Error(` ${errorMessage}`);
  }

  return await response.json();
};
