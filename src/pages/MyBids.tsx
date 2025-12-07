import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Clock,
  Trophy,
  Shield,
  ExternalLink,
  Wallet,
  ImageIcon,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useMyBids } from '@/hooks/useMyBids';
import { CONTRACTS } from '@/config/contracts';

const SEPOLIA_EXPLORER = 'https://sepolia.etherscan.io';

export default function MyBids() {
  const { isConnected, address, hasBid, bidInfo, isLoading } = useMyBids();

  const formatTimeRemaining = (endTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = endTime - now;

    if (remaining <= 0) return 'Ended';

    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const getAuctionStatus = () => {
    if (!bidInfo) return null;

    if (bidInfo.revealReady) {
      return bidInfo.isWinner ? (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          <Trophy className="w-3 h-3 mr-1" />
          Winner!
        </Badge>
      ) : (
        <Badge variant="secondary" className="bg-muted/50">
          <XCircle className="w-3 h-3 mr-1" />
          Not Won
        </Badge>
      );
    }

    if (bidInfo.ended) {
      return (
        <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Revealing...
        </Badge>
      );
    }

    const now = Math.floor(Date.now() / 1000);
    if (bidInfo.biddingEnd > now) {
      return (
        <Badge className="bg-primary/20 text-primary border-primary/30">
          <Clock className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="bg-muted/50">
        <AlertCircle className="w-3 h-3 mr-1" />
        Bidding Closed
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Bids</h1>
            <p className="text-muted-foreground">
              Track your auction participation and bid status
            </p>
          </div>

          {!isConnected ? (
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="py-16 text-center">
                <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
                <p className="text-muted-foreground mb-4">
                  Please connect your wallet to view your bid history
                </p>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="py-16 text-center">
                <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading your bids...</p>
              </CardContent>
            </Card>
          ) : !hasBid ? (
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="py-16 text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Bids Yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't placed any bids in the current auction
                </p>
                <Link to="/#auction">
                  <Button variant="default" className="bg-primary hover:bg-primary/90">
                    View Auction
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : bidInfo && (
            <Card className="border-border/50 bg-card/50 backdrop-blur overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Item Image */}
                <div className="w-full md:w-1/3 aspect-square md:aspect-auto relative bg-muted/30">
                  {bidInfo.itemImageUrl ? (
                    <img
                      src={bidInfo.itemImageUrl}
                      alt={bidInfo.itemName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-muted-foreground/50" />
                    </div>
                  )}
                </div>

                {/* Bid Details */}
                <div className="flex-1">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl mb-1">{bidInfo.itemName}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {bidInfo.itemDescription}
                        </CardDescription>
                      </div>
                      {getAuctionStatus()}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <Separator className="bg-border/50" />

                    {/* Bid Info */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Your Bid</span>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-primary" />
                          <span className="text-sm font-mono">Encrypted (FHE Protected)</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Auction Status</span>
                        <span className="text-sm">
                          {bidInfo.revealReady
                            ? 'Completed'
                            : bidInfo.ended
                            ? 'Revealing Winner...'
                            : formatTimeRemaining(bidInfo.biddingEnd)}
                        </span>
                      </div>

                      {bidInfo.encryptedBidHandle && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Bid Handle</span>
                          <code className="text-xs font-mono bg-muted/50 px-2 py-1 rounded">
                            {bidInfo.encryptedBidHandle.slice(0, 10)}...{bidInfo.encryptedBidHandle.slice(-8)}
                          </code>
                        </div>
                      )}
                    </div>

                    {/* Winner Result */}
                    {bidInfo.revealReady && (
                      <>
                        <Separator className="bg-border/50" />
                        <div className={`p-4 rounded-lg ${
                          bidInfo.isWinner
                            ? 'bg-yellow-500/10 border border-yellow-500/30'
                            : 'bg-muted/30'
                        }`}>
                          {bidInfo.isWinner ? (
                            <div className="flex items-center gap-3">
                              <Trophy className="w-8 h-8 text-yellow-500" />
                              <div>
                                <h4 className="font-semibold text-yellow-400">
                                  Congratulations! You Won!
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Winning bid: {bidInfo.winningAmount?.toString()} units
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                              <div>
                                <h4 className="font-semibold">Auction Completed</h4>
                                <p className="text-sm text-muted-foreground">
                                  Your bid was not the highest. Better luck next time!
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <Separator className="bg-border/50" />

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Link to="/#auction" className="flex-1">
                        <Button variant="outline" className="w-full">
                          View Auction
                        </Button>
                      </Link>
                      <a
                        href={`${SEPOLIA_EXPLORER}/address/${CONTRACTS.ShieldedAuction}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          )}

          {/* Info Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border/50 bg-card/30 backdrop-blur">
              <CardContent className="pt-6">
                <Shield className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">Privacy Protected</h3>
                <p className="text-sm text-muted-foreground">
                  Your bid amount is encrypted using FHE and remains private until reveal
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/30 backdrop-blur">
              <CardContent className="pt-6">
                <Clock className="w-8 h-8 text-secondary mb-3" />
                <h3 className="font-semibold mb-1">Fair Bidding</h3>
                <p className="text-sm text-muted-foreground">
                  All bids are processed equally without revealing amounts to others
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/30 backdrop-blur">
              <CardContent className="pt-6">
                <Trophy className="w-8 h-8 text-yellow-500 mb-3" />
                <h3 className="font-semibold mb-1">Transparent Results</h3>
                <p className="text-sm text-muted-foreground">
                  Winner determination is verifiable on-chain after reveal
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
