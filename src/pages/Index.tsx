import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { AuctionStatus } from "@/components/AuctionStatus";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />

        {/* Auction Section */}
        <section id="auction" className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <AuctionStatus />
          </div>
        </section>

        <div id="features">
          <Features />
        </div>
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
