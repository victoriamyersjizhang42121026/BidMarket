const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const contractAddress = "0x539Cc55558578efE9b590DBb7e2e603e6352f5B8";

  console.log("📋 Checking Auction Status...\n");
  console.log("Contract Address:", contractAddress);

  // Load ABI
  const abiPath = path.join(__dirname, "../../src/config/ShieldedAuctionABI.json");
  const abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));

  const contract = new hre.ethers.Contract(contractAddress, abi, hre.ethers.provider);

  // Read auction item details
  const itemName = await contract.itemName();
  const itemDescription = await contract.itemDescription();
  const itemImageUrl = await contract.itemImageUrl();

  console.log("\n🎨 Auction Item:");
  console.log("  Name:", itemName);
  console.log("  Description:", itemDescription);
  console.log("  Image URL:", itemImageUrl);

  // Read auction status
  const seller = await contract.seller();
  const biddingEnd = await contract.biddingEnd();
  const ended = await contract.ended();
  const revealReady = await contract.revealReady();
  const bidderCount = await contract.bidderCount();

  console.log("\n📊 Auction Status:");
  console.log("  Seller:", seller);
  console.log("  Bidding End:", new Date(Number(biddingEnd) * 1000).toLocaleString());
  console.log("  Time Remaining:", Math.max(0, Number(biddingEnd) - Math.floor(Date.now() / 1000)), "seconds");
  console.log("  Ended:", ended);
  console.log("  Reveal Ready:", revealReady);
  console.log("  Bidder Count:", Number(bidderCount));

  if (Number(bidderCount) > 0) {
    console.log("\n👥 Bidders:");
    const bidders = await contract.getBidders();
    bidders.forEach((bidder, i) => {
      console.log(`  ${i + 1}. ${bidder}`);
    });
  }

  if (revealReady) {
    const winner = await contract.getWinner();
    console.log("\n🏆 Winner:");
    console.log("  Address:", winner[0]);
    console.log("  Bid Amount:", Number(winner[1]));
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
