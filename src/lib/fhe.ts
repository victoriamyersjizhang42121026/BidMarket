import { bytesToHex, getAddress } from "viem";
import type { Address } from "viem";

declare global {
    interface Window {
        RelayerSDK?: any;
        relayerSDK?: any;
        ethereum?: any;
        okxwallet?: any;
    }
}

let fheInstance: any = null;

const getSDK = () => {
    if (typeof window === "undefined") {
        throw new Error("FHE SDK requires a browser environment");
    }
    const sdk = window.RelayerSDK || window.relayerSDK;
    if (!sdk) {
        throw new Error("Relayer SDK not loaded. Ensure the CDN script tag is present.");
    }
    return sdk;
};

export const initializeFHE = async (provider?: any) => {
    if (fheInstance) return fheInstance;
    if (typeof window === "undefined") {
        throw new Error("FHE SDK requires a browser environment");
    }

    const ethereumProvider =
        provider || window.ethereum || window.okxwallet?.provider || window.okxwallet;
    if (!ethereumProvider) {
        throw new Error("No wallet provider detected. Connect a wallet first.");
    }

    const sdk = getSDK();
    const { initSDK, createInstance, SepoliaConfig } = sdk;
    await initSDK();
    const config = { ...SepoliaConfig, network: ethereumProvider };
    fheInstance = await createInstance(config);
    return fheInstance;
};

const getInstance = async (provider?: any) => {
    if (fheInstance) return fheInstance;
    return initializeFHE(provider);
};

/**
 * Encrypt a uint64 bid amount for auction
 * @param bidAmount - The bid amount to encrypt
 * @param contractAddress - The auction contract address
 * @param userAddress - The user's wallet address
 * @param provider - Optional ethereum provider
 */
export const encryptBidAmount = async (
    bidAmount: number | bigint,
    contractAddress: Address,
    userAddress: Address,
    provider?: any
): Promise<{
    handle: `0x${string}`;
    proof: `0x${string}`;
}> => {
    console.log('[FHE] Encrypting bid amount:', bidAmount);
    const instance = await getInstance(provider);
    const contractAddr = getAddress(contractAddress);
    const userAddr = getAddress(userAddress);

    console.log('[FHE] Creating encrypted input for:', {
        contract: contractAddr,
        user: userAddr,
    });

    const input = instance.createEncryptedInput(contractAddr, userAddr);
    input.add64(BigInt(bidAmount));  // euint64 for bid amount

    console.log('[FHE] Encrypting input...');
    const { handles, inputProof } = await input.encrypt();
    console.log('[FHE] Encryption complete, handles:', handles.length);

    if (handles.length < 1) {
        throw new Error('FHE SDK returned insufficient handles');
    }

    return {
        handle: bytesToHex(handles[0]) as `0x${string}`,
        proof: bytesToHex(inputProof) as `0x${string}`,
    };
};

/**
 * Decrypt a euint64 value using public decryption (v0.9.1 model)
 * @param handle - The encrypted value handle (bytes32)
 * @param contractAddress - The contract address
 * @param provider - Optional ethereum provider
 */
export const publicDecrypt = async (
    handle: `0x${string}`,
    contractAddress: Address,
    provider?: any
): Promise<bigint | null> => {
    try {
        console.log('[FHE] Public decrypting handle:', handle);
        const instance = await getInstance(provider);
        const contractAddr = getAddress(contractAddress);

        const sdk = getSDK();
        const { publicDecrypt: sdkPublicDecrypt } = sdk;

        if (!sdkPublicDecrypt) {
            console.error('[FHE] publicDecrypt not available in SDK');
            return null;
        }

        const result = await sdkPublicDecrypt(handle, contractAddr);
        console.log('[FHE] Decryption result:', result);

        return BigInt(result.value);
    } catch (error) {
        console.error('[FHE] Public decryption failed:', error);
        return null;
    }
};

/**
 * Check if FHE SDK is loaded and ready
 */
export const isFHEReady = (): boolean => {
    if (typeof window === "undefined") return false;
    return !!(window.RelayerSDK || window.relayerSDK);
};

/**
 * Check if FHE instance is initialized
 */
export const isFheReady = (): boolean => {
    return fheInstance !== null;
};

export const isSDKLoaded = isFHEReady;

/**
 * Wait for FHE SDK to be loaded (with timeout)
 */
export const waitForFHE = async (timeoutMs: number = 10000): Promise<boolean> => {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
        if (isFHEReady()) {
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return false;
};

/**
 * Get FHE status for debugging
 */
export const getFHEStatus = (): {
    sdkLoaded: boolean;
    instanceReady: boolean;
} => {
    return {
        sdkLoaded: isFHEReady(),
        instanceReady: fheInstance !== null,
    };
};

// Legacy exports for backward compatibility
export const encryptUint64 = async (
    value: number,
    contractAddress: string,
    userAddress: string
): Promise<{ handle: string; proof: string }> => {
    const result = await encryptBidAmount(
        value,
        contractAddress as Address,
        userAddress as Address
    );
    return {
        handle: result.handle,
        proof: result.proof,
    };
};

export const decryptUint64 = async (
    ciphertext: string,
    contractAddress: string,
    _userAddress: string
): Promise<number | null> => {
    const result = await publicDecrypt(
        ciphertext as `0x${string}`,
        contractAddress as Address
    );
    return result ? Number(result) : null;
};
