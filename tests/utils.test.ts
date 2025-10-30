/**
 * Utility Functions Tests
 *
 * Tests for helper functions used throughout the application
 */

import { describe, it, expect } from 'vitest';

describe('Utility Functions', () => {
  describe('Address Formatting', () => {
    const formatAddress = (address: string, prefixLength = 6, suffixLength = 4): string => {
      if (!address || address.length < prefixLength + suffixLength) {
        return address;
      }
      return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
    };

    it('should format full address to short version', () => {
      const fullAddress = '0x1234567890123456789012345678901234567890';
      const formatted = formatAddress(fullAddress);

      expect(formatted).toBe('0x1234...7890');
    });

    it('should handle custom prefix and suffix lengths', () => {
      const address = '0x1234567890123456789012345678901234567890';
      const formatted = formatAddress(address, 8, 6);

      expect(formatted).toBe('0x123456...567890');
    });

    it('should return original if address is too short', () => {
      const shortAddress = '0x123';
      const formatted = formatAddress(shortAddress);

      expect(formatted).toBe(shortAddress);
    });

    it('should handle empty address', () => {
      const formatted = formatAddress('');
      expect(formatted).toBe('');
    });
  });

  describe('Time Formatting', () => {
    const formatTimeRemaining = (endTime: number): string => {
      const now = Date.now() / 1000;
      const remaining = endTime - now;

      if (remaining <= 0) return 'Ended';

      const days = Math.floor(remaining / 86400);
      const hours = Math.floor((remaining % 86400) / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);

      if (days > 0) return `${days}d ${hours}h`;
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
    };

    it('should format days and hours correctly', () => {
      const now = Date.now() / 1000;
      const endTime = now + (2 * 86400) + (5 * 3600); // 2 days 5 hours

      const formatted = formatTimeRemaining(endTime);
      expect(formatted).toBe('2d 5h');
    });

    it('should format hours and minutes when less than a day', () => {
      const now = Date.now() / 1000;
      const endTime = now + (3 * 3600) + (30 * 60); // 3 hours 30 minutes

      const formatted = formatTimeRemaining(endTime);
      expect(formatted).toBe('3h 30m');
    });

    it('should format only minutes when less than an hour', () => {
      const now = Date.now() / 1000;
      const endTime = now + (45 * 60); // 45 minutes

      const formatted = formatTimeRemaining(endTime);
      expect(formatted).toBe('45m');
    });

    it('should return "Ended" for past timestamps', () => {
      const now = Date.now() / 1000;
      const endTime = now - 3600; // 1 hour ago

      const formatted = formatTimeRemaining(endTime);
      expect(formatted).toBe('Ended');
    });
  });

  describe('BigInt Formatting', () => {
    const formatBigInt = (value: bigint, decimals = 18): string => {
      const divisor = 10n ** BigInt(decimals);
      const wholePart = value / divisor;
      const fractionalPart = value % divisor;

      if (fractionalPart === 0n) {
        return wholePart.toString();
      }

      const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
      const trimmed = fractionalStr.replace(/0+$/, '');

      return `${wholePart}.${trimmed}`;
    };

    it('should format whole numbers correctly', () => {
      const value = 1000000000000000000n; // 1 ETH in wei
      const formatted = formatBigInt(value);

      expect(formatted).toBe('1');
    });

    it('should format decimals correctly', () => {
      const value = 1500000000000000000n; // 1.5 ETH in wei
      const formatted = formatBigInt(value);

      expect(formatted).toBe('1.5');
    });

    it('should handle very small amounts', () => {
      const value = 1n; // 1 wei
      const formatted = formatBigInt(value);

      expect(formatted).toBe('0.000000000000000001');
    });

    it('should handle zero', () => {
      const value = 0n;
      const formatted = formatBigInt(value);

      expect(formatted).toBe('0');
    });

    it('should work with different decimals', () => {
      const value = 1000000n; // 1 USDC (6 decimals)
      const formatted = formatBigInt(value, 6);

      expect(formatted).toBe('1');
    });
  });

  describe('Validation Helpers', () => {
    const isValidAddress = (address: string): boolean => {
      return /^0x[0-9a-fA-F]{40}$/.test(address);
    };

    const isValidNumber = (value: string): boolean => {
      const num = Number(value);
      return !isNaN(num) && num >= 0;
    };

    it('should validate correct Ethereum addresses', () => {
      const validAddresses = [
        '0x1234567890123456789012345678901234567890',
        '0xAbCdEf1234567890ABCDEF1234567890abcdef12',
      ];

      validAddresses.forEach(addr => {
        expect(isValidAddress(addr)).toBe(true);
      });
    });

    it('should reject invalid addresses', () => {
      const invalidAddresses = [
        '1234567890123456789012345678901234567890', // no 0x
        '0x12345', // too short
        '0xGGGG567890123456789012345678901234567890', // invalid hex
        '', // empty
      ];

      invalidAddresses.forEach(addr => {
        expect(isValidAddress(addr)).toBe(false);
      });
    });

    it('should validate positive numbers', () => {
      expect(isValidNumber('100')).toBe(true);
      expect(isValidNumber('0')).toBe(true);
      expect(isValidNumber('123.45')).toBe(true);
    });

    it('should reject invalid numbers', () => {
      expect(isValidNumber('-100')).toBe(false);
      expect(isValidNumber('abc')).toBe(false);
      expect(isValidNumber('')).toBe(false);
    });
  });

  describe('Array Utilities', () => {
    const uniqueBy = <T>(arr: T[], key: keyof T): T[] => {
      const seen = new Set();
      return arr.filter(item => {
        const value = item[key];
        if (seen.has(value)) return false;
        seen.add(value);
        return true;
      });
    };

    it('should remove duplicates by key', () => {
      const items = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 1, name: 'C' },
      ];

      const unique = uniqueBy(items, 'id');

      expect(unique.length).toBe(2);
      expect(unique[0].id).toBe(1);
      expect(unique[1].id).toBe(2);
    });

    it('should handle empty arrays', () => {
      const unique = uniqueBy([], 'id' as any);
      expect(unique).toEqual([]);
    });

    it('should handle arrays with no duplicates', () => {
      const items = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 3, name: 'C' },
      ];

      const unique = uniqueBy(items, 'id');
      expect(unique.length).toBe(3);
    });
  });

  describe('String Utilities', () => {
    const truncate = (str: string, maxLength: number): string => {
      if (str.length <= maxLength) return str;
      return str.slice(0, maxLength - 3) + '...';
    };

    const capitalize = (str: string): string => {
      if (!str) return str;
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    it('should truncate long strings', () => {
      const long = 'This is a very long string that needs truncation';
      const truncated = truncate(long, 20);

      expect(truncated).toBe('This is a very lo...');
      expect(truncated.length).toBe(20);
    });

    it('should not truncate short strings', () => {
      const short = 'Short';
      const truncated = truncate(short, 20);

      expect(truncated).toBe('Short');
    });

    it('should capitalize strings correctly', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('World');
      expect(capitalize('hELLO')).toBe('Hello');
    });

    it('should handle empty strings', () => {
      expect(capitalize('')).toBe('');
    });
  });

  describe('Error Handling Utilities', () => {
    const parseError = (error: unknown): string => {
      if (error instanceof Error) return error.message;
      if (typeof error === 'string') return error;
      return 'Unknown error occurred';
    };

    it('should parse Error objects', () => {
      const error = new Error('Test error');
      expect(parseError(error)).toBe('Test error');
    });

    it('should parse string errors', () => {
      expect(parseError('String error')).toBe('String error');
    });

    it('should handle unknown error types', () => {
      expect(parseError(null)).toBe('Unknown error occurred');
      expect(parseError(undefined)).toBe('Unknown error occurred');
      expect(parseError(123)).toBe('Unknown error occurred');
    });
  });

  describe('Sorting Utilities', () => {
    const sortByTimestamp = <T extends { timestamp: number }>(
      items: T[],
      ascending = false
    ): T[] => {
      return [...items].sort((a, b) =>
        ascending ? a.timestamp - b.timestamp : b.timestamp - a.timestamp
      );
    };

    it('should sort by timestamp descending (default)', () => {
      const items = [
        { id: 1, timestamp: 1000 },
        { id: 2, timestamp: 3000 },
        { id: 3, timestamp: 2000 },
      ];

      const sorted = sortByTimestamp(items);

      expect(sorted[0].timestamp).toBe(3000);
      expect(sorted[1].timestamp).toBe(2000);
      expect(sorted[2].timestamp).toBe(1000);
    });

    it('should sort by timestamp ascending', () => {
      const items = [
        { id: 1, timestamp: 3000 },
        { id: 2, timestamp: 1000 },
        { id: 3, timestamp: 2000 },
      ];

      const sorted = sortByTimestamp(items, true);

      expect(sorted[0].timestamp).toBe(1000);
      expect(sorted[1].timestamp).toBe(2000);
      expect(sorted[2].timestamp).toBe(3000);
    });

    it('should not modify original array', () => {
      const items = [
        { id: 1, timestamp: 3000 },
        { id: 2, timestamp: 1000 },
      ];

      const original = [...items];
      sortByTimestamp(items);

      expect(items).toEqual(original);
    });
  });
});
