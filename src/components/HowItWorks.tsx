import { FileText, Lock, TrendingUp, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: FileText,
    number: "01",
    title: "Auction Created",
    description: "A seller creates a sealed-bid auction for a single item with set parameters and duration.",
  },
  {
    icon: Lock,
    number: "02",
    title: "Submit Encrypted Bid",
    description: "You submit your bid as homomorphic ciphertext. It's recorded on-chain but remains completely private.",
  },
  {
    icon: TrendingUp,
    number: "03",
    title: "Contract Tracks Highest Bid",
    description: "Smart contract compares encrypted bids without decryption, keeping track of the highest bidder.",
  },
  {
    icon: CheckCircle,
    number: "04",
    title: "Winner Revealed",
    description: "When auction ends, the winner's address is revealed on-chain. Bid amounts stay encrypted forever.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 relative bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            How It <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Four simple steps to participate in privacy-preserving auctions
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-24 left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50"></div>

          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Number Badge */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-primary-foreground">
                    {step.number}
                  </div>
                </div>

                {/* Icon */}
                <div className="p-4 rounded-lg bg-card border border-border/50 group-hover:border-primary/50 transition-all">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
