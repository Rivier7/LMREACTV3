import { useMutation } from '@tanstack/react-query';
import { initiateLogin, verify2FA, resend2FACode } from '../api/auth';

/**
 * Initiate login - sends email/password and gets 2FA code
 * Used in: LoginPage (first step)
 */
export function useInitiateLogin() {
  return useMutation({
    mutationFn: ({ email, password }) => initiateLogin(email, password),
  });
}

/**
 * Verify 2FA code and get JWT token
 * Used in: LoginPage (second step)
 */
export function useVerify2FA() {
  return useMutation({
    mutationFn: ({ email, code }) => verify2FA(email, code),
  });
}

/**
 * Resend 2FA code
 * Used in: LoginPage
 */
export function useResend2FACode() {
  return useMutation({
    mutationFn: email => resend2FACode(email),
  });
}
