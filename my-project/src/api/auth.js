import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/auth';

// Initialize login and get 2FA code
export const initiateLogin = async (email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/login`, {
      email,
      password
    });
    return response.data; // Returns LoginInitiationResponse
  } catch (error) {
    throw error.response?.data || 'Login failed';
  }
};

// Verify 2FA code and get JWT token
export const verify2FA = async (email, code) => {
  try {
    const response = await axios.post(`${BASE_URL}/verify-2fa`, {
      email,
      twoFactorCode: code, // Changed to match backend expectation
    });

    if (response.data.token) {
      return response.data; // Returns LoginResponse with JWT token
    } else {
      throw new Error(response.data.message || 'Verification failed');
    }
  } catch (error) {
    if (error.response?.data) {
      throw new Error(error.response.data);
    }
    throw new Error('Verification failed');
  }
};

// Resend 2FA code
export const resend2FACode = async (email) => {
  try {
    const response = await axios.post(`${BASE_URL}/resend-2fa?email=${email}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Failed to resend code';
  }
};

// Get auth headers for other API calls
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  };
};