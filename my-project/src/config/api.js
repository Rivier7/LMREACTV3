/**
 * API Configuration
 *
 * Centralizes API base URL configuration with environment validation.
 * In production, fails explicitly if VITE_API_BASE_URL is not configured.
 * In development, falls back to localhost for convenience.
 */

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const IS_PRODUCTION = import.meta.env.PROD;
const DEFAULT_DEV_URL = 'http://localhost:8080/api';

// Validate configuration in production
if (IS_PRODUCTION && !VITE_API_BASE_URL) {
  throw new Error(
    'VITE_API_BASE_URL environment variable is not configured. ' +
      'Please set this variable in your production environment or CI/CD pipeline.'
  );
}

// Warn in development if using fallback
if (!IS_PRODUCTION && !VITE_API_BASE_URL) {
  console.warn(
    '[API Config] VITE_API_BASE_URL not set, using default:',
    DEFAULT_DEV_URL
  );
}

/**
 * Base API URL with /api suffix
 * Example: https://api.example.com/api
 */
export const API_BASE_URL = VITE_API_BASE_URL || DEFAULT_DEV_URL;

/**
 * Base server URL without /api suffix
 * Example: https://api.example.com
 */
export const API_SERVER_URL = API_BASE_URL.replace('/api', '');

/**
 * Check if running in production mode
 */
export const isProduction = IS_PRODUCTION;
