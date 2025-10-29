import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Clock,
  Users,
  Trophy,
  Lock,
  Unlock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ImageIcon,
} from 'lucide-react';
import { useAuction } from '@/hooks/useAuction';
import { BidDialog } from './BidDialog';
import { formatEther } from 'viem';

export function AuctionStatus() {
  const { address } = useAccount();
  const {
    seller,
    biddingEnd,
    ended,
    revealPending,
    revealFinalized,
    bidderCount,
    winner,
    itemName,
    itemDescription,
    itemImageUrl,
    endAuction,
    isPending,
    isConfirming,
  } = useAuction();

  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const isSeller = address && seller && address.toLowerCase() === seller.toLowerCase();
  const canBid = !ended && biddingEnd && Date.now() / 1000 < biddingEnd;
  const canEnd = isSeller && biddingEnd && Date.now() / 1000 >= biddingEnd && !ended;

  useEffect(() => {
    if (!biddingEnd) return;

    const updateTime = () => {
      const now = Date.now() / 1000;
      const remaining = biddingEnd - now;

      if (remaining <= 0) {
        setTimeRemaining('Auction ended');
        return;
      }

      const days = Math.floor(remaining / 86400);
      const hours = Math.floor((remaining % 86400) / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      const seconds = Math.floor(remaining % 60);

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [biddingEnd]);

  const getStatusBadge = () => {
    if (revealFinalized) {
      return <Badge variant="default" className="gap-1"><CheckCircle2 className="w-3 h-3" /> Winner Revealed</Badge>;
    }
    if (revealPending) {
      return <Badge variant="secondary" className="gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Revealing...</Badge>;
    }
    if (ended) {
      return <Badge variant="secondary" className="gap-1"><Unlock className="w-3 h-3" /> Ended</Badge>;
    }
    if (canBid) {
      return <Badge variant="default" className="gap-1"><Lock className="w-3 h-3" /> Active</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  return (
    <>
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-primary" />
                Sealed-Bid Auction
              </CardTitle>
              <CardDescription>
                Bids encrypted with FHE technology
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Auction Item */}
          {(itemName || itemImageUrl) && (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Item Image */}
                {itemImageUrl ? (
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-border">
                    <img
                      src={itemImageUrl}
                      alt={itemName || 'Auction item'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&h=600&fit=crop';
                      }}
                    />
                  </div>
                ) : (
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}

                {/* Item Details */}
                <div className="space-y-4">
                  {itemName && (
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">{itemName}</h3>
                      {itemDescription && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {itemDescription}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Time Remaining */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Time Remaining
              </div>
              <div className="text-2xl font-bold text-foreground">
                {timeRemaining || 'Loading...'}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                Total Bidders
              </div>
              <div className="text-2xl font-bold text-primary">
                {bidderCount}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" />
                Privacy
              </div>
              <div className="text-2xl font-bold text-secondary">
                100%
              </div>
            </div>
          </div>

          <Separator />

          {/* Winner Information */}
          {revealFinalized && winner && (
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Trophy className="w-5 h-5 text-primary" />
                Auction Winner
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Winner Address</div>
                <div className="font-mono text-sm break-all">{winner[0]}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Winning Bid</div>
                <div className="text-2xl font-bold text-primary">
                  {formatEther(winner[1])} ETH
                </div>
              </div>
            </div>
          )}

          {/* Reveal Pending Message */}
          {revealPending && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-medium">Decrypting winner...</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The winner is being revealed asynchronously. This may take a few minutes.
              </p>
            </div>
          )}

          {/* Privacy Notice */}
          {!ended && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <AlertCircle className="w-4 h-4 text-primary" />
                Complete Privacy
              </div>
              <p className="text-xs text-muted-foreground">
                All bids are encrypted using Fully Homomorphic Encryption. Your bid amount remains private throughout the entire auction process.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {canBid && (
              <Button
                onClick={() => setBidDialogOpen(true)}
                className="flex-1"
                size="lg"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Submit Bid
              </Button>
            )}

            {canEnd && (
              <Button
                onClick={() => endAuction()}
                variant="secondary"
                className="flex-1"
                size="lg"
                disabled={isPending || isConfirming}
              >
                {isPending || isConfirming ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Ending...
                  </>
                ) : (
                  <>
                    <Unlock className="w-5 h-5 mr-2" />
                    End Auction
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Seller Badge */}
          {isSeller && (
            <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-3">
              <p className="text-sm text-center text-muted-foreground">
                You are the <span className="font-semibold text-secondary">seller</span> of this auction
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <BidDialog open={bidDialogOpen} onOpenChange={setBidDialogOpen} />
    </>
  );
}
