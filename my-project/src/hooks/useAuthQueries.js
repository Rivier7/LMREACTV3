import { useMutation } from '@tanstack/react-query';
import { initiateLogin, verify2FA, resend2FACode } from '../api/auth';

/**
 * Initiate login - sends email/password and gets 2FA code
 * Used in: LoginPage (first step)
 */
export function useInitiateLogin() {
  return useMutation({
    mutationFn: ({ email, password }) => initiateLogin(email, password),
    onError: error => {
      console.error('Login initiation failed:', error);
    },
  });
}

/**
 * Verify 2FA code and get JWT token
 * Used in: LoginPage (second step)
 */
export function useVerify2FA() {
  return useMutation({
    mutationFn: ({ email, code }) => verify2FA(email, code),
    onSuccess: data => {
      // Token is handled by AuthContext, so we don't need to do anything here
      console.log('2FA verification successful');
    },
    onError: error => {
      console.error('2FA verification failed:', error);
    },
  });
}

/**
 * Resend 2FA code
 * Used in: LoginPage
 */
export function useResend2FACode() {
  return useMutation({
    mutationFn: email => resend2FACode(email),
    onError: error => {
      console.error('Failed to resend 2FA code:', error);
    },
  });
}
