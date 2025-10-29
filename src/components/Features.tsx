import { Shield, Lock, Eye, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Homomorphic Encryption",
    description: "Bids are encrypted on-chain. Smart contracts track the highest bid without ever decrypting individual amounts.",
  },
  {
    icon: Lock,
    title: "Sealed-Bid Privacy",
    description: "No one can see your bid amount - not other bidders, not even the auctioneer. Only you know what you offered.",
  },
  {
    icon: Eye,
    title: "Transparent Winners",
    description: "While bids stay private, the winner is publicly verifiable on-chain, ensuring complete fairness and trust.",
  },
  {
    icon: Zap,
    title: "One-Shot Auctions",
    description: "Single-item, one-time sealed auctions. Submit your best bid once and let the smart contract do the rest.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Why ShieldedAuction?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Privacy-preserving technology meets transparent blockchain auctions
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-6 bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)] group"
            >
              <div className="flex flex-col items-start space-y-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
