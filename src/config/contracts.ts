import ShieldedAuctionABI from './ShieldedAuctionABI.json';

export const CONTRACTS = {
  ShieldedAuction: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
};

export const ABIS = {
  ShieldedAuction: ShieldedAuctionABI,
};

export const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID) || 11155111;
