const BASE_URL = 'http://localhost:8080/lanes';
const BASE_URL2 = 'http://localhost:8080/Account';
const BASE_URL3 = 'http://localhost:8080/api/flights/validate-flight';

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

// ✅ Update a lane
export const updateLane = async (id, updatedLane, flights) => {
  const response = await fetch(`${BASE_URL}/updateLane/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ lane: updatedLane, flights }),
  });
  if (!response.ok) throw new Error(`Failed to update lane with ID ${id}`);
  return await response.json();
};


// ✅ Get TAT for a lane
export const getTAT = async (updatedLane, flights) => {
  const response = await fetch(`${BASE_URL}/calculateTAT`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ lane: updatedLane, flights }),
  });

  if (!response.ok) throw new Error(`Failed to calculate TAT`);

  const text = await response.text();
  console.log(text);

  return text;
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
export const allLaneCount = async (id) => {
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
export const getFlights = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}/flights`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to fetch flights from lane with ID ${id}`);
  return await response.json();
};

// ✅ Download Excel for an account
export const getAccountExcel = async (id) => {
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

// ✅ Upload Excel to create/update accounts
export const postAccountExcel = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BASE_URL2}/Post-Account_Excel`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: formData,
  });

  if (!response.ok) throw new Error(await response.text());
  return await response.text();
};

// ✅ Get a single lane by ID
export const getLanebyId = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to fetch lane with ID ${id}`);
  return await response.json();
};

// ✅ Get a single account by ID
export const getAccountbyId = async (id) => {
  const response = await fetch(`${BASE_URL2}/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to fetch account with ID ${id}`);
  return await response.json();
};

// ✅ Delete an account by ID
export const deleteAccountbyId = async (id) => {
  const response = await fetch(`${BASE_URL2}/delete/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to delete account with ID ${id}`);
  return await response.json();
};

// ✅ Validate a flight
export const validateFlight = async (flight) => {
  const response = await fetch(BASE_URL3, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(flight),
  });
  if (!response.ok) throw new Error("Flight validation failed.");
  return await response.json();
};

