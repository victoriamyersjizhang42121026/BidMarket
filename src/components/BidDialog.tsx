import { useState, useEffect, useRef } from 'react';
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
import { toast } from 'sonner';
import {
  toastTxPending,
  toastTxSuccess,
  toastTxError,
  toastUserRejected,
  isUserRejection,
} from '@/lib/toast-utils';

interface BidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BidDialog({ open, onOpenChange }: BidDialogProps) {
  const { address } = useAccount();
  const { submitBid, isPending, isConfirming, isConfirmed, hash, error } = useAuction();
  const [bidAmount, setBidAmount] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [submittedBidAmount, setSubmittedBidAmount] = useState('');
  const prevHashRef = useRef<`0x${string}` | undefined>();

  // Monitor transaction hash for pending notification
  useEffect(() => {
    if (hash && hash !== prevHashRef.current && submittedBidAmount) {
      prevHashRef.current = hash;
      toastTxPending(hash, `Submitting bid of ${submittedBidAmount} ETH...`);
    }
  }, [hash, submittedBidAmount]);

  // Monitor transaction confirmation
  useEffect(() => {
    if (isConfirmed && hash && submittedBidAmount) {
      console.log('[Bid] Transaction confirmed:', hash);
      toastTxSuccess(hash, `Bid of ${submittedBidAmount} ETH confirmed!`);

      // Reset form and close dialog
      setBidAmount('');
      setSubmittedBidAmount('');
      prevHashRef.current = undefined;
      onOpenChange(false);
    }
  }, [isConfirmed, hash, submittedBidAmount, onOpenChange]);

  // Monitor transaction errors
  useEffect(() => {
    if (error) {
      if (isUserRejection(error)) {
        toastUserRejected();
      } else {
        toastTxError(hash, error);
      }
      setIsEncrypting(false);
      setSubmittedBidAmount('');
    }
  }, [error, hash]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!address) {
      toast.error('Wallet not connected', {
        description: 'Please connect your wallet to submit a bid',
      });
      return;
    }

    if (!bidAmount || Number(bidAmount) <= 0) {
      toast.error('Invalid bid amount', {
        description: 'Please enter a valid bid amount',
      });
      return;
    }

    try {
      setIsEncrypting(true);
      toast.loading('Encrypting bid...', {
        id: 'encrypting',
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

      toast.success('Encryption complete', {
        id: 'encrypting',
        description: 'Submitting your encrypted bid to the blockchain...',
        duration: 2000,
      });

      console.log('[Bid] Calling submitBid...');

      // Save the bid amount before submitting (so we can show it in confirmation toast)
      setSubmittedBidAmount(bidAmount);

      // Submit the encrypted bid
      await submitBid(handle as `0x${string}`, proof as `0x${string}`);

      // Note: Don't show success toast here, we'll show it when transaction is confirmed
      console.log('[Bid] Transaction submitted, waiting for confirmation...');
    } catch (err) {
      console.error('[Bid] Submission failed:', err);
      setIsEncrypting(false);
      setSubmittedBidAmount('');
      toast.dismiss('encrypting');

      if (err instanceof Error) {
        if (isUserRejection(err)) {
          toastUserRejected();
        } else {
          toast.error('Bid submission failed', {
            description: err.message || 'Unknown error occurred',
          });
        }
      }
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
