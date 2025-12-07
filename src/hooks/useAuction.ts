import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS, ABIS } from '@/config/contracts';

export function useAuction() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Read auction state
  const { data: seller } = useReadContract({
    address: CONTRACTS.ShieldedAuction,
    abi: ABIS.ShieldedAuction,
    functionName: 'seller',
  });

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

  const { data: bidderCount } = useReadContract({
    address: CONTRACTS.ShieldedAuction,
    abi: ABIS.ShieldedAuction,
    functionName: 'bidderCount',
  });

  const { data: winner, refetch: refetchWinner } = useReadContract({
    address: CONTRACTS.ShieldedAuction,
    abi: ABIS.ShieldedAuction,
    functionName: 'getWinner',
    query: {
      enabled: revealReady === true,
    },
  });

  // Read auction item details
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

  // Submit bid
  const submitBid = async (encryptedAmount: `0x${string}`, proof: `0x${string}`) => {
    return writeContract({
      address: CONTRACTS.ShieldedAuction,
      abi: ABIS.ShieldedAuction,
      functionName: 'bid',
      args: [encryptedAmount, proof],
    });
  };

  // End auction (seller only)
  const endAuction = async () => {
    return writeContract({
      address: CONTRACTS.ShieldedAuction,
      abi: ABIS.ShieldedAuction,
      functionName: 'endAuction',
    });
  };

  return {
    // Contract state
    seller,
    biddingEnd: biddingEnd ? Number(biddingEnd) : undefined,
    ended,
    revealReady,
    // For backward compatibility with UI components
    revealPending: ended && !revealReady,
    revealFinalized: revealReady,
    bidderCount: bidderCount ? Number(bidderCount) : 0,
    winner: winner as [string, bigint] | undefined,

    // Item details
    itemName: itemName as string | undefined,
    itemDescription: itemDescription as string | undefined,
    itemImageUrl: itemImageUrl as string | undefined,

    // Actions
    submitBid,
    endAuction,
    refetchWinner,

    // Transaction state
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error,
  };
}
