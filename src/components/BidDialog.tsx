import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { parseEther } from 'viem';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, Shield } from 'lucide-react';
import { useAuction } from '@/hooks/useAuction';
import { encryptUint64, initializeFHE } from '@/lib/fhe';
import { CONTRACTS } from '@/config/contracts';
import { useToast } from '@/hooks/use-toast';

interface BidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BidDialog({ open, onOpenChange }: BidDialogProps) {
  const { address } = useAccount();
  const { submitBid, isPending, isConfirming, isConfirmed, hash } = useAuction();
  const { toast } = useToast();
  const [bidAmount, setBidAmount] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [submittedBidAmount, setSubmittedBidAmount] = useState('');

  // Monitor transaction confirmation
  useEffect(() => {
    if (isConfirmed && hash && submittedBidAmount) {
      console.log('[Bid] Transaction confirmed:', hash);

      const explorerUrl = `https://sepolia.etherscan.io/tx/${hash}`;

      toast({
        title: '✅ Bid submitted successfully!',
        description: (
          <div className="space-y-2">
            <p>Your encrypted bid of {submittedBidAmount} ETH has been confirmed on-chain.</p>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm font-medium flex items-center gap-1"
            >
              View on Etherscan →
            </a>
          </div>
        ),
        duration: 10000, // Show for 10 seconds
      });

      // Reset form and close dialog
      setBidAmount('');
      setSubmittedBidAmount('');
      onOpenChange(false);
    }
  }, [isConfirmed, hash, submittedBidAmount, toast, onOpenChange]);

  // Show transaction pending notification
  useEffect(() => {
    if (hash && isPending) {
      console.log('[Bid] Transaction pending:', hash);

      const explorerUrl = `https://sepolia.etherscan.io/tx/${hash}`;

      toast({
        title: '⏳ Transaction pending...',
        description: (
          <div className="space-y-2">
            <p>Your bid transaction is being confirmed.</p>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm font-medium flex items-center gap-1"
            >
              View on Etherscan →
            </a>
          </div>
        ),
        duration: 5000,
      });
    }
  }, [hash, isPending, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!address) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to submit a bid',
        variant: 'destructive',
      });
      return;
    }

    if (!bidAmount || Number(bidAmount) <= 0) {
      toast({
        title: 'Invalid bid amount',
        description: 'Please enter a valid bid amount',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsEncrypting(true);
      toast({
        title: 'Encrypting bid...',
        description: 'Please wait while we encrypt your bid using FHE',
      });

      console.log('[Bid] Starting encryption process...');

      // Initialize FHE
      await initializeFHE();

      console.log('[Bid] FHE initialized, encrypting amount:', bidAmount);

      // Convert ETH to Wei (must be an integer for BigInt)
      const bidInWei = parseEther(bidAmount);
      console.log('[Bid] Bid in Wei:', bidInWei.toString());

      // Encrypt the bid amount (in Wei)
      const { handle, proof } = await encryptUint64(
        Number(bidInWei),
        CONTRACTS.ShieldedAuction,
        address
      );

      console.log('[Bid] Encryption complete:', { handle, proof });
      setIsEncrypting(false);

      toast({
        title: 'Encryption complete',
        description: 'Submitting your encrypted bid to the blockchain...',
      });

      console.log('[Bid] Calling submitBid...');

      // Save the bid amount before submitting (so we can show it in confirmation toast)
      setSubmittedBidAmount(bidAmount);

      // Submit the encrypted bid
      await submitBid(handle as `0x${string}`, proof as `0x${string}`);

      // Note: Don't show success toast here, we'll show it when transaction is confirmed
      console.log('[Bid] Transaction submitted, waiting for confirmation...');
    } catch (error) {
      console.error('[Bid] Submission failed:', error);
      setIsEncrypting(false);
      toast({
        title: 'Bid submission failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  const isLoading = isPending || isConfirming || isEncrypting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Submit Sealed Bid
          </DialogTitle>
          <DialogDescription>
            Your bid will be encrypted using FHE technology. No one will be able to see your bid amount until the auction ends.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bidAmount">Bid Amount (ETH)</Label>
              <Input
                id="bidAmount"
                type="number"
                step="0.001"
                min="0"
                placeholder="0.00"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Enter the amount you want to bid in ETH
              </p>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Shield className="w-4 h-4 text-primary" />
                Privacy Guaranteed
              </div>
              <p className="text-xs text-muted-foreground">
                Your bid is encrypted client-side before submission. The contract processes your bid without ever revealing the amount to anyone.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !bidAmount}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEncrypting ? 'Encrypting...' : isPending || isConfirming ? 'Submitting...' : 'Submit Bid'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
