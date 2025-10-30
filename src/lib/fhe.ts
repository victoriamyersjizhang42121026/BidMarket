import { getAddress } from 'viem';

declare global {
  interface Window {
    relayerSDK?: {
      initSDK: () => Promise<void>;
      createInstance: (config: Record<string, unknown>) => Promise<any>;
      SepoliaConfig: Record<string, unknown>;
    };
    ethereum?: any;
    okxwallet?: any;
  }
}

let fheInstance: any = null;
let sdkPromise: Promise<any> | null = null;

const SDK_URL = 'https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs';

/**
 * Dynamically load Zama FHE SDK from CDN
 */
const loadSdk = async (): Promise<any> => {
  if (typeof window === 'undefined') {
    throw new Error('FHE SDK requires browser environment');
  }

  if (window.relayerSDK) {
    console.log('✅ SDK already loaded');
    return window.relayerSDK;
  }

  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${SDK_URL}"]`) as HTMLScriptElement | null;
      if (existing) {
        console.log('⏳ SDK script tag exists, waiting...');
        // Wait a bit for SDK to initialize
        const checkInterval = setInterval(() => {
          if (window.relayerSDK) {
            clearInterval(checkInterval);
            resolve(window.relayerSDK);
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkInterval);
          if (window.relayerSDK) {
            resolve(window.relayerSDK);
          } else {
            reject(new Error('SDK script exists but window.relayerSDK not initialized'));
          }
        }, 5000);
        return;
      }

      console.log('📦 Loading SDK from CDN...');
      const script = document.createElement('script');
      script.src = SDK_URL;
      script.async = true;

      script.onload = () => {
        console.log('📦 Script loaded, waiting for SDK initialization...');
        // Give SDK time to initialize
        setTimeout(() => {
          if (window.relayerSDK) {
            console.log('✅ SDK initialized');
            resolve(window.relayerSDK);
          } else {
            console.error('❌ window.relayerSDK still undefined after load');
            reject(new Error('relayerSDK unavailable after load'));
          }
        }, 500);
      };

      script.onerror = () => {
        console.error('❌ Failed to load SDK script');
        reject(new Error('Failed to load FHE SDK'));
      };

      document.body.appendChild(script);
    });
  }

  return sdkPromise;
};

/**
 * Initialize FHE instance with Sepolia network configuration
 */
export async function initializeFHE(provider?: any): Promise<any> {
  if (fheInstance) {
    return fheInstance;
  }

  if (typeof window === 'undefined') {
    throw new Error('FHE SDK requires browser environment');
  }

  const ethereumProvider = provider ||
    window.ethereum ||
    (window as any).okxwallet?.provider ||
    (window as any).okxwallet ||
    (window as any).coinbaseWalletExtension;

  if (!ethereumProvider) {
    throw new Error('Ethereum provider not found. Please connect your wallet first.');
  }

  console.log('🔌 Using Ethereum provider:', {
    isOKX: !!(window as any).okxwallet,
    isMetaMask: !!(window.ethereum as any)?.isMetaMask,
  });

  const sdk = await loadSdk();
  if (!sdk) {
    throw new Error('FHE SDK not available');
  }

  await sdk.initSDK();

  const config = {
    ...sdk.SepoliaConfig,
    network: ethereumProvider,
  };

  fheInstance = await sdk.createInstance(config);
  console.log('✅ FHE instance initialized for Sepolia');

  return fheInstance;
}

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

/**
 * Encrypt a uint64 value
 */
export const encryptUint64 = async (
  value: number,
  contractAddress: string,
  userAddress: string
): Promise<{ handle: string; proof: string }> => {
  console.log('[FHE] Encrypting value:', value);

  const fhe = await initializeFHE();
  const checksumContract = getAddress(contractAddress);
  const checksumUser = getAddress(userAddress);

  console.log('[FHE] Creating encrypted input...');
  const input = fhe.createEncryptedInput(checksumContract, checksumUser);
  input.add64(value);

  console.log('[FHE] Encrypting...');
  const result = await input.encrypt();
  const { handles, inputProof } = result;

  console.log('[FHE] ✅ Encryption complete');

  return ensureHandlePayload(handles, inputProof);
};

/**
 * Decrypt a euint64 value
 */
export const decryptUint64 = async (
  ciphertext: string,
  contractAddress: string,
  userAddress: string
): Promise<number | null> => {
  try {
    console.log('[FHE] Decrypting ciphertext:', ciphertext);

    const fhe = await initializeFHE();
    const checksumContract = getAddress(contractAddress);
    const checksumUser = getAddress(userAddress);

    console.log('[FHE] Requesting decryption...');
    const decrypted = await fhe.decrypt(checksumContract, ciphertext, checksumUser);

    console.log('[FHE] ✅ Decryption complete');
    return Number(decrypted);
  } catch (error) {
    console.error('[FHE] Decryption failed:', error);
    return null;
  }
};
