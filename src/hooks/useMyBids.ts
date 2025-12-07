import { useAccount, useReadContract } from 'wagmi';
import { CONTRACTS, ABIS } from '@/config/contracts';

export interface BidInfo {
  auctionAddress: `0x${string}`;
  itemName: string;
  itemDescription: string;
  itemImageUrl: string;
  hasBid: boolean;
  encryptedBidHandle: `0x${string}` | null;
  biddingEnd: number;
  ended: boolean;
  revealReady: boolean;
  isWinner: boolean;
  winningAmount: bigint | null;
}

export function useMyBids() {
  const { address, isConnected } = useAccount();

  // Check if user has bid
  const { data: hasBid, isLoading: isLoadingHasBid } = useReadContract({
    address: CONTRACTS.ShieldedAuction,
    abi: ABIS.ShieldedAuction,
    functionName: 'hasBid',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Get user's encrypted bid handle
  const { data: encryptedBid, isLoading: isLoadingEncryptedBid } = useReadContract({
    address: CONTRACTS.ShieldedAuction,
    abi: ABIS.ShieldedAuction,
    functionName: 'getEncryptedBid',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && hasBid === true,
    },
  });

  // Get auction item details
  const { data: itemName } = useReadContract({
    address: CONTRACTS.ShieldedAuction,
    abi: ABIS.ShieldedAuction,
    functionName: 'itemName',
  });

  const { data: itemDescription } = useReadContract({
    address: CONTRACTS.ShieldedAuction,
    abi: ABIS.ShieldedAuction,
    functionName: 'itemDescription',
  });

  const { data: itemImageUrl } = useReadContract({
    address: CONTRACTS.ShieldedAuction,
    abi: ABIS.ShieldedAuction,
    functionName: 'itemImageUrl',
  });

  // Get auction status
  const { data: biddingEnd } = useReadContract({
    address: CONTRACTS.ShieldedAuction,
    abi: ABIS.ShieldedAuction,
    functionName: 'biddingEnd',
  });

  const { data: ended } = useReadContract({
    address: CONTRACTS.ShieldedAuction,
    abi: ABIS.ShieldedAuction,
    functionName: 'ended',
  });

  const { data: revealReady } = useReadContract({
    address: CONTRACTS.ShieldedAuction,
    abi: ABIS.ShieldedAuction,
    functionName: 'revealReady',
  });

  // Get winner info if reveal is ready
  const { data: winner } = useReadContract({
    address: CONTRACTS.ShieldedAuction,
    abi: ABIS.ShieldedAuction,
    functionName: 'getWinner',
    query: {
      enabled: revealReady === true,
    },
  });

  const winnerData = winner as [string, bigint] | undefined;
  const isWinner = revealReady && winnerData && address
    ? winnerData[0].toLowerCase() === address.toLowerCase()
    : false;

  const bidInfo: BidInfo | null = hasBid ? {
    auctionAddress: CONTRACTS.ShieldedAuction,
    itemName: itemName as string || '',
    itemDescription: itemDescription as string || '',
    itemImageUrl: itemImageUrl as string || '',
    hasBid: true,
    encryptedBidHandle: encryptedBid as `0x${string}` || null,
    biddingEnd: biddingEnd ? Number(biddingEnd) : 0,
    ended: ended as boolean || false,
    revealReady: revealReady as boolean || false,
    isWinner,
    winningAmount: isWinner && winnerData ? winnerData[1] : null,
  } : null;

  return {
    isConnected,
    address,
    hasBid: hasBid as boolean || false,
    bidInfo,
    isLoading: isLoadingHasBid || isLoadingEncryptedBid,
  };
}
