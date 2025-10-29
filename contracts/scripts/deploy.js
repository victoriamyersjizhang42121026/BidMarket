const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying ShieldedAuction Contract...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy ShieldedAuction with 7 days bidding time
  console.log("Deploying ShieldedAuction...");
  const biddingTime = 7 * 24 * 60 * 60; // 7 days in seconds
  const ShieldedAuction = await hre.ethers.getContractFactory("ShieldedAuction");
  const auction = await ShieldedAuction.deploy(biddingTime);
  await auction.waitForDeployment();
  const auctionAddress = await auction.getAddress();
  console.log("✅ ShieldedAuction deployed to:", auctionAddress);

  const biddingEnd = await auction.biddingEnd();
  const endDate = new Date(Number(biddingEnd) * 1000);
  console.log("📅 Bidding ends at:", endDate.toLocaleString());

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    ShieldedAuction: auctionAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    biddingEnd: Number(biddingEnd),
    biddingEndDate: endDate.toISOString()
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `${hre.network.name}.json`;
  fs.writeFileSync(
    path.join(deploymentsDir, filename),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n📋 === Deployment Summary ===");
  console.log("Network:", hre.network.name);
  console.log("ShieldedAuction:", auctionAddress);
  console.log("Deployer:", deployer.address);
  console.log("Bidding End:", endDate.toLocaleString());
  console.log(`\n💾 Deployment saved to: deployments/${filename}`);

  console.log("\n📝 Next steps:");
  console.log(`1. Update frontend .env with:`);
  console.log(`   VITE_CONTRACT_ADDRESS=${auctionAddress}`);
  console.log(`2. Start frontend: cd .. && npm run dev`);
  console.log(`3. Submit encrypted bids!`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
