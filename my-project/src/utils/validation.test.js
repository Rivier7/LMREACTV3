import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidFlightNumber,
  isValidAirportCode,
  isValidTime,
  sanitizeInput,
} from './validation';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@example.co.uk')).toBe(true);
      expect(isValidEmail('admin@company.org')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user @example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
    });
  });

  describe('isValidFlightNumber', () => {
    it('should return true for valid flight numbers', () => {
      expect(isValidFlightNumber('AA123')).toBe(true);
      expect(isValidFlightNumber('DL4567')).toBe(true);
      expect(isValidFlightNumber('UAL890')).toBe(true);
      expect(isValidFlightNumber('aa123')).toBe(true); // Should handle lowercase
    });

    it('should return false for invalid flight numbers', () => {
      expect(isValidFlightNumber('A123')).toBe(false); // Too short airline code
      expect(isValidFlightNumber('AAAA123')).toBe(false); // Too long airline code
      expect(isValidFlightNumber('AA')).toBe(false); // No number
      expect(isValidFlightNumber('12345')).toBe(false); // No letters
      expect(isValidFlightNumber('')).toBe(false);
      expect(isValidFlightNumber(null)).toBe(false);
    });
  });

  describe('isValidAirportCode', () => {
    it('should return true for valid IATA codes', () => {
      expect(isValidAirportCode('LAX')).toBe(true);
      expect(isValidAirportCode('JFK')).toBe(true);
      expect(isValidAirportCode('ORD')).toBe(true);
      expect(isValidAirportCode('lax')).toBe(true); // Should handle lowercase
    });

    it('should return false for invalid IATA codes', () => {
      expect(isValidAirportCode('LA')).toBe(false); // Too short
      expect(isValidAirportCode('LAXX')).toBe(false); // Too long
      expect(isValidAirportCode('LA1')).toBe(false); // Contains number
      expect(isValidAirportCode('')).toBe(false);
      expect(isValidAirportCode(null)).toBe(false);
    });
  });

  describe('isValidTime', () => {
    it('should return true for valid 24-hour times', () => {
      expect(isValidTime('00:00')).toBe(true);
      expect(isValidTime('12:30')).toBe(true);
      expect(isValidTime('23:59')).toBe(true);
      expect(isValidTime('08:15')).toBe(true);
    });

    it('should return false for invalid times', () => {
      expect(isValidTime('24:00')).toBe(false); // Invalid hour
      expect(isValidTime('12:60')).toBe(false); // Invalid minute
      expect(isValidTime('5:30')).toBe(false); // Missing leading zero
      expect(isValidTime('12:5')).toBe(false); // Missing leading zero in minutes
      expect(isValidTime('12:30 PM')).toBe(false); // 12-hour format
      expect(isValidTime('')).toBe(false);
      expect(isValidTime(null)).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should escape HTML special characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
    });

    it('should escape quotes and apostrophes', () => {
      expect(sanitizeInput('O\'Reilly "Books"')).toBe(
        'O&#x27;Reilly &quot;Books&quot;'
      );
    });

    it('should handle empty or null inputs', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
    });

    it('should preserve safe text', () => {
      expect(sanitizeInput('Hello World 123')).toBe('Hello World 123');
    });
  });
});
