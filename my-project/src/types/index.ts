/**
 * Type Definitions for LMREACTV3
 *
 * FAANG Best Practice: Centralized type definitions
 */

// ============================================================================
// API Types
// ============================================================================

export interface Account {
  accountId: number;
  accountName: string;
  totalCount: number;
  validCount: number;
  invalidCount: number;
  description?: string;
}

export interface LaneCount {
  total: number;
  valid: number;
  invalid: number;
}

export interface Lane {
  id: number;
  laneId: string;
  origin: string;
  destination: string;
  status: 'valid' | 'invalid';
  accountId: number;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Error Handling Types
// ============================================================================

export type ErrorSeverityType = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategoryType = 'api' | 'validation' | 'auth' | 'unexpected' | 'network';

export interface ErrorContext {
  category?: ErrorCategoryType;
  severity?: ErrorSeverityType;
  endpoint?: string;
  context?: string;
  [key: string]: unknown;
}

export interface ErrorInfo {
  message: string;
  stack?: string;
  category: ErrorCategoryType;
  severity: ErrorSeverityType;
  timestamp: string;
  url: string;
  userAgent: string;
  [key: string]: unknown;
}

// ============================================================================
// Auth Types
// ============================================================================

export interface User {
  email: string;
  sub?: string;
  exp?: number;
  iat?: number;
}

export interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

export interface LoginCredentials {
  email: string;
  verificationCode: string;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface ErrorMessageProps {
  message: string;
  title?: string;
  onDismiss?: () => void;
  severity?: 'error' | 'warning' | 'info';
  className?: string;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export interface PageErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
}

// ============================================================================
// Hook Return Types
// ============================================================================

export interface UseErrorHandlerReturn {
  error: ErrorInfo | null;
  handleError: (error: Error, context?: ErrorContext) => ErrorInfo;
  clearError: () => void;
  hasError: boolean;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
}

export interface ApiError {
  message: string;
  response?: {
    status: number;
    data?: unknown;
  };
  config?: {
    url?: string;
  };
}

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

// ============================================================================
// Environment Variables
// ============================================================================

export interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_ENABLE_DEBUG: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
}

export interface ImportMeta {
  readonly env: ImportMetaEnv;
}
