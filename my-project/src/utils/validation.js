/**
 * Validation utilities for the application
 */

/**
 * Validates an email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a flight number format (e.g., "AA123", "DL4567")
 * @param {string} flightNumber - Flight number to validate
 * @returns {boolean} True if valid format
 */
export const isValidFlightNumber = (flightNumber) => {
  if (!flightNumber || typeof flightNumber !== 'string') return false;
  // 2-3 letter airline code + 1-4 digit number
  const flightRegex = /^[A-Z]{2,3}\d{1,4}$/;
  return flightRegex.test(flightNumber.toUpperCase());
};

/**
 * Validates airport code (IATA 3-letter code)
 * @param {string} code - Airport code to validate
 * @returns {boolean} True if valid IATA code
 */
export const isValidAirportCode = (code) => {
  if (!code || typeof code !== 'string') return false;
  const airportRegex = /^[A-Z]{3}$/;
  return airportRegex.test(code.toUpperCase());
};

/**
 * Validates time format (HH:MM in 24-hour format)
 * @param {string} time - Time to validate
 * @returns {boolean} True if valid time format
 */
export const isValidTime = (time) => {
  if (!time || typeof time !== 'string') return false;
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

/**
 * Sanitizes user input to prevent XSS attacks
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
