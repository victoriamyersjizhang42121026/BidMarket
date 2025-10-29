import { getAddress } from 'viem';

declare global {
  interface Window {
    FheRelayer: any;
  }
}

let fheInstance: any = null;

export const initializeFHE = async () => {
  if (fheInstance) return fheInstance;

  if (typeof window === 'undefined' || !window.FheRelayer) {
    throw new Error('FHE Relayer SDK not loaded. Make sure the CDN script is included.');
  }

  try {
    fheInstance = await window.FheRelayer.create();
    console.log('FHE Relayer initialized successfully');
    return fheInstance;
  } catch (error) {
    console.error('Failed to initialize FHE:', error);
    throw error;
  }
};

const ensureHandlePayload = (
  handles: unknown[],
  inputProof: Uint8Array
): { handle: `0x${string}`; proof: `0x${string}` } => {
  const toHex = (bytes: Uint8Array): `0x${string}` => {
    return `0x${Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')}` as `0x${string}`;
  };

  return {
    handle: toHex(handles[0] as Uint8Array),
    proof: toHex(inputProof),
  };
};

export const encryptUint64 = async (
  value: number,
  contractAddress: string,
  userAddress: string
): Promise<{ handle: string; proof: string }> => {
  const fhe = await initializeFHE();

  const checksumContract = getAddress(contractAddress);
  const checksumUser = getAddress(userAddress);

  const input = fhe.createEncryptedInput(checksumContract, checksumUser);
  input.add64(value);

  const result = await input.encrypt();
  const { handles, inputProof } = result;

  return ensureHandlePayload(handles, inputProof);
};

export const decryptUint64 = async (
  ciphertext: string,
  contractAddress: string,
  userAddress: string
): Promise<number | null> => {
  try {
    const fhe = await initializeFHE();
    const checksumContract = getAddress(contractAddress);
    const checksumUser = getAddress(userAddress);

    const decrypted = await fhe.decrypt(ciphertext, checksumContract, checksumUser);
    return Number(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};
