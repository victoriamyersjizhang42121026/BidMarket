/**
 * FHE Encryption Tests
 *
 * Tests for the Fully Homomorphic Encryption (FHE) utility functions
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';
import { initializeFHE, encryptUint64, decryptUint64 } from '../src/lib/fhe';

// Mock window.relayerSDK
const mockFheInstance = {
  createEncryptedInput: vi.fn((contractAddress: string, userAddress: string) => ({
    add64: vi.fn(),
    encrypt: vi.fn().mockResolvedValue({
      handles: [new Uint8Array([0x01, 0x02, 0x03, 0x04])],
      inputProof: new Uint8Array([0x05, 0x06, 0x07, 0x08])
    })
  })),
  decrypt: vi.fn().mockResolvedValue(12345n)
};

const mockSDK = {
  initSDK: vi.fn().mockResolvedValue(undefined),
  createInstance: vi.fn().mockResolvedValue(mockFheInstance),
  SepoliaConfig: {
    gatewayUrl: 'https://gateway.zama.ai',
    chainId: 11155111
  }
};

describe('FHE Utility Functions', () => {
  beforeAll(() => {
    // Setup global window object
    global.window = {
      relayerSDK: mockSDK,
      ethereum: {
        isMetaMask: true,
        request: vi.fn()
      }
    } as any;
  });

  describe('initializeFHE', () => {
    it('should initialize FHE instance successfully', async () => {
      const instance = await initializeFHE();

      expect(instance).toBeDefined();
      expect(mockSDK.initSDK).toHaveBeenCalled();
      expect(mockSDK.createInstance).toHaveBeenCalled();
    });

    it('should reuse existing FHE instance', async () => {
      const callCount = mockSDK.createInstance.mock.calls.length;

      await initializeFHE();
      await initializeFHE();

      // Should not create a new instance
      expect(mockSDK.createInstance.mock.calls.length).toBe(callCount);
    });

    it('should throw error if ethereum provider not found', async () => {
      const originalEthereum = window.ethereum;
      delete (window as any).ethereum;

      // Reset fheInstance to force re-initialization
      const fheModule = await import('../src/lib/fhe');
      (fheModule as any).fheInstance = null;

      await expect(initializeFHE()).rejects.toThrow('Ethereum provider not found');

      (window as any).ethereum = originalEthereum;
    });
  });

  describe('encryptUint64', () => {
    it('should encrypt a uint64 value successfully', async () => {
      const value = 12345;
      const contractAddress = '0x1234567890123456789012345678901234567890';
      const userAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

      const result = await encryptUint64(value, contractAddress, userAddress);

      expect(result).toBeDefined();
      expect(result.handle).toMatch(/^0x[0-9a-f]+$/);
      expect(result.proof).toMatch(/^0x[0-9a-f]+$/);
    });

    it('should handle different uint64 values', async () => {
      const contractAddress = '0x1234567890123456789012345678901234567890';
      const userAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

      const testValues = [0, 1, 1000, 999999, Number.MAX_SAFE_INTEGER];

      for (const value of testValues) {
        const result = await encryptUint64(value, contractAddress, userAddress);
        expect(result.handle).toBeDefined();
        expect(result.proof).toBeDefined();
      }
    });

    it('should validate contract address format', async () => {
      const value = 12345;
      const invalidAddress = 'invalid-address';
      const userAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

      await expect(encryptUint64(value, invalidAddress, userAddress)).rejects.toThrow();
    });
  });

  describe('decryptUint64', () => {
    it('should decrypt a uint64 value successfully', async () => {
      const ciphertext = '0x1234567890abcdef';
      const contractAddress = '0x1234567890123456789012345678901234567890';
      const userAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

      const result = await decryptUint64(ciphertext, contractAddress, userAddress);

      expect(result).toBe(12345);
    });

    it('should return null on decryption failure', async () => {
      mockFheInstance.decrypt.mockRejectedValueOnce(new Error('Decryption failed'));

      const ciphertext = '0x1234567890abcdef';
      const contractAddress = '0x1234567890123456789012345678901234567890';
      const userAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

      const result = await decryptUint64(ciphertext, contractAddress, userAddress);

      expect(result).toBeNull();
    });

    it('should handle invalid ciphertext gracefully', async () => {
      const invalidCiphertext = 'not-a-hex-string';
      const contractAddress = '0x1234567890123456789012345678901234567890';
      const userAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

      const result = await decryptUint64(invalidCiphertext, contractAddress, userAddress);

      // Should handle gracefully, either return null or throw
      expect(result === null || typeof result === 'number').toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle SDK initialization failure', async () => {
      mockSDK.initSDK.mockRejectedValueOnce(new Error('SDK init failed'));

      // Reset fheInstance
      const fheModule = await import('../src/lib/fhe');
      (fheModule as any).fheInstance = null;

      await expect(initializeFHE()).rejects.toThrow();
    });

    it('should handle network errors during encryption', async () => {
      const encryptMock = mockFheInstance.createEncryptedInput().encrypt as any;
      encryptMock.mockRejectedValueOnce(new Error('Network error'));

      const value = 12345;
      const contractAddress = '0x1234567890123456789012345678901234567890';
      const userAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

      await expect(encryptUint64(value, contractAddress, userAddress)).rejects.toThrow();
    });
  });

  describe('Data Format Validation', () => {
    it('should produce hex strings with 0x prefix', async () => {
      const value = 12345;
      const contractAddress = '0x1234567890123456789012345678901234567890';
      const userAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

      const result = await encryptUint64(value, contractAddress, userAddress);

      expect(result.handle).toMatch(/^0x[0-9a-f]+$/);
      expect(result.proof).toMatch(/^0x[0-9a-f]+$/);
    });

    it('should handle checksum addresses', async () => {
      const value = 12345;
      const checksumAddress = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed'; // EIP-55 checksum
      const userAddress = '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359';

      const result = await encryptUint64(value, checksumAddress, userAddress);

      expect(result).toBeDefined();
      expect(result.handle).toBeDefined();
    });
  });
});
