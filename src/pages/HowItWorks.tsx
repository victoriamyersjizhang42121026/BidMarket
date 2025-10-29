import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Lock,
  Shield,
  TrendingUp,
  Users,
  CheckCircle2,
  Circle,
  PlayCircle,
  Rocket,
  Target,
  Sparkles,
  Eye,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <Badge className="mb-4" variant="outline">
              <Shield className="w-3 h-3 mr-1" />
              Privacy-First Technology
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              How ShieldedAuction Works
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Understanding the complete auction flow with Fully Homomorphic Encryption
            </p>
          </div>
        </section>

        {/* Demo Video Section */}
        <section className="py-12 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <PlayCircle className="w-6 h-6 text-primary" />
                  Live Demo Video
                </CardTitle>
                <CardDescription>
                  Watch the complete auction flow from bidding to winner reveal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center border-2 border-primary/20">
                  <div className="text-center space-y-4">
                    <Eye className="w-20 h-20 text-primary/40 mx-auto" />
                    <div>
                      <p className="text-xl font-semibold text-foreground mb-2">Demo Video Coming Soon</p>
                      <p className="text-muted-foreground">
                        Complete walkthrough of the ShieldedAuction platform
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Auction Process */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">Auction Process</h2>

            <div className="space-y-6">
              {/* Step 1 */}
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                      1
                    </div>
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 mb-2">
                        <Lock className="w-5 h-5 text-primary" />
                        Connect & Browse
                      </CardTitle>
                      <CardDescription>
                        Connect your wallet and view the current auction details including time remaining and number of participants.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Step 2 */}
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                      2
                    </div>
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Submit Encrypted Bid
                      </CardTitle>
                      <CardDescription>
                        Enter your bid amount. The value is encrypted client-side using Zama's FHE technology before submission. Your bid remains completely private.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong>Privacy Guarantee:</strong> Your bid is encrypted in your browser using euint64 encryption. No one, including the seller and other bidders, can see your bid amount.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                      3
                    </div>
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Homomorphic Comparison
                      </CardTitle>
                      <CardDescription>
                        The smart contract uses FHE to compare encrypted bids without decryption, maintaining the highest bid and winner index in encrypted form.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Step 4 */}
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                      4
                    </div>
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-primary" />
                        Auction Ends
                      </CardTitle>
                      <CardDescription>
                        When the bidding deadline passes, the seller can end the auction and trigger the asynchronous winner reveal process through the FHE gateway.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Step 5 */}
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="bg-secondary text-secondary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                      5
                    </div>
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-secondary" />
                        Winner Revealed
                      </CardTitle>
                      <CardDescription>
                        The FHE gateway decrypts only the winning bid and winner address. All other bids remain permanently encrypted, protecting bidder privacy.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <Separator />

        {/* Roadmap Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <Badge className="mb-4" variant="outline">
                <Rocket className="w-3 h-3 mr-1" />
                Development Roadmap
              </Badge>
              <h2 className="text-3xl font-bold mb-4">Project Roadmap</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our journey to build the most privacy-preserving auction platform on Ethereum
              </p>
            </div>

            <div className="space-y-8">
              {/* Phase 1 - Completed */}
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-green-500 hover:bg-green-600 text-white">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                    <h3 className="text-2xl font-bold">Phase 1: Core Platform</h3>
                  </div>
                  <CardDescription className="text-base">Q4 2025</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Smart Contract Development</p>
                      <p className="text-sm text-muted-foreground">ShieldedAuction contract with FHE integration deployed on Sepolia testnet</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Frontend Application</p>
                      <p className="text-sm text-muted-foreground">Complete React application with wallet integration and FHE encryption</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Real-time Auction Monitoring</p>
                      <p className="text-sm text-muted-foreground">Live countdown timer, bidder count, and auction status display</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Encrypted Bid Submission</p>
                      <p className="text-sm text-muted-foreground">Client-side FHE encryption using Zama Relayer SDK 0.2.0</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Asynchronous Winner Reveal</p>
                      <p className="text-sm text-muted-foreground">Gateway integration for secure decryption of winner information</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Phase 2 - In Progress */}
              <Card className="border-secondary/30">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="secondary" className="gap-1">
                      <Target className="w-3 h-3" />
                      Planned
                    </Badge>
                    <h3 className="text-2xl font-bold">Phase 2: Enhanced Features</h3>
                  </div>
                  <CardDescription className="text-base">Q1 2026</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Multi-Auction Support</p>
                      <p className="text-sm text-muted-foreground">Allow multiple simultaneous auctions with different sellers and categories</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">NFT Integration</p>
                      <p className="text-sm text-muted-foreground">Support for NFT auctions with metadata display and transfer automation</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Bid History & Analytics</p>
                      <p className="text-sm text-muted-foreground">Personal auction history and encrypted bid tracking for users</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Reserve Price Feature</p>
                      <p className="text-sm text-muted-foreground">Encrypted reserve price that must be met for auction success</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Mainnet Deployment</p>
                      <p className="text-sm text-muted-foreground">Launch on Ethereum mainnet with comprehensive security audits</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Phase 3 - Future */}
              <Card className="border-muted">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className="gap-1">
                      <Sparkles className="w-3 h-3" />
                      Future
                    </Badge>
                    <h3 className="text-2xl font-bold">Phase 3: Ecosystem Growth</h3>
                  </div>
                  <CardDescription className="text-base">Q2-Q3 2026</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Cross-Chain Support</p>
                      <p className="text-sm text-muted-foreground">Expand to Polygon, Arbitrum, and other EVM-compatible chains</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Mobile Application</p>
                      <p className="text-sm text-muted-foreground">Native iOS and Android apps with push notifications for auction updates</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Governance Token</p>
                      <p className="text-sm text-muted-foreground">Community governance for platform parameters and feature proposals</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Marketplace Integration</p>
                      <p className="text-sm text-muted-foreground">Connect with major NFT marketplaces for seamless asset transfer</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Advanced Auction Types</p>
                      <p className="text-sm text-muted-foreground">Dutch auctions, reverse auctions, and time-weighted bidding mechanisms</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Technical Deep Dive */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">Technical Implementation</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    FHE Encryption
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong>Type:</strong> euint64 (64-bit encrypted unsigned integer)</p>
                  <p><strong>SDK:</strong> Zama Relayer SDK 0.2.0</p>
                  <p><strong>Encryption:</strong> Client-side using WASM</p>
                  <p><strong>Operations:</strong> Homomorphic comparison (FHE.gt, FHE.select)</p>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    Smart Contract
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong>Language:</strong> Solidity 0.8.24</p>
                  <p><strong>Platform:</strong> Zama fhEVM 0.8.0</p>
                  <p><strong>Network:</strong> Sepolia Testnet</p>
                  <p><strong>Gas:</strong> Optimized with 200 runs</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;
