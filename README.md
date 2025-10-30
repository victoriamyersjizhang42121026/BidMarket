# ShieldedAuction (BidMarket)

<div align="center">

![ShieldedAuction Banner](https://img.shields.io/badge/ShieldedAuction-Privacy--First_Auctions-blue?style=for-the-badge)
[![Zama fhEVM](https://img.shields.io/badge/Zama-fhEVM%200.8.0-purple?style=for-the-badge)](https://docs.zama.ai/fhevm)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**The world's first privacy-preserving sealed-bid auction platform powered by Fully Homomorphic Encryption**

[Live Demo](https://bidmarket-75smz1lnn-songsus-projects.vercel.app) • [Documentation](#documentation) • [Architecture](#architecture)

</div>

---

## 🎯 Overview

ShieldedAuction is a revolutionary blockchain-based auction platform that implements **sealed-bid auctions** with complete privacy using Zama's Fully Homomorphic Encryption (FHE) technology. Unlike traditional auctions where bids might be visible or manipulable, ShieldedAuction ensures that:

- 📦 **All bids remain encrypted** throughout the entire auction
- 🔒 **No one can see bid amounts** - not even the seller or other bidders
- 🎲 **Fair winner determination** through homomorphic comparison
- 🛡️ **Prevention of price manipulation** through sealed bidding
- ✅ **Transparent reveal** of only the winner and winning amount

### Why Sealed-Bid Auctions?

Traditional open-bid auctions suffer from several critical issues:

1. **Price Manipulation** 🎭
   - Bidders can see others' bids and adjust strategically
   - Last-minute bid sniping becomes dominant strategy
   - Artificial price inflation through coordinated bidding
   - Collusion between bidders to keep prices low

2. **Information Asymmetry** 📊
   - Early bidders reveal their valuation to competitors
   - Late bidders have unfair information advantage
   - Sellers can manipulate auctions based on visible bids

3. **Privacy Concerns** 🔍
   - Competitors can analyze bidding patterns
   - Personal valuation becomes public knowledge
   - Risk of targeted retaliation in business contexts

**ShieldedAuction solves these problems by:**
- ✅ **One bid per address** - prevents bid manipulation and gaming
- ✅ **Complete encryption** - no information leakage at any stage
- ✅ **True sealed bidding** - eliminates strategic timing advantages
- ✅ **Fair price discovery** - bidders submit their true valuation
- ✅ **Immutable records** - transparent yet private auction history

---

## 🌟 Key Features

### For Bidders

🔐 **Complete Privacy**
- Your bid amount is encrypted client-side using FHE
- No one (including the seller) can see your bid
- Losing bids remain permanently encrypted
- Only the winning bid is revealed after the auction

🎯 **Fair Competition**
- One bid per address prevents gaming
- No last-minute sniping or bid manipulation
- True sealed-bid mechanism
- Level playing field for all participants

⏱️ **Real-time Updates**
- Live countdown to auction end
- Participant count tracking
- Instant bid confirmation
- Winner announcement after reveal

### For Sellers

💼 **Easy Setup**
- Create auctions with custom duration
- Set item details and images
- Automatic winner determination
- Secure decryption via FHE gateway

📊 **Transparent Results**
- Only winning bid and winner revealed
- All other bids remain encrypted
- Immutable auction records
- Full blockchain verification

🔒 **Trust & Security**
- Smart contract controlled
- No manual intervention needed
- Tamper-proof execution
- Gateway-verified decryption

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Wagmi v2   │  │  RainbowKit  │  │  Zama SDK    │      │
│  │  (Web3)      │  │  (Wallets)   │  │  (FHE)       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Zama Relayer Service                       │
│              (FHE Encryption/Decryption)                     │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│            Ethereum Sepolia Testnet (fhEVM)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         ShieldedAuction Smart Contract               │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │   │
│  │  │   Bids[]   │  │ HighestBid │  │  Winner    │    │   │
│  │  │ (Encrypted)│  │(Encrypted) │  │ (Revealed) │    │   │
│  │  └────────────┘  └────────────┘  └────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     FHE Gateway                              │
│              (Asynchronous Decryption)                       │
└─────────────────────────────────────────────────────────────┘
```

### Smart Contract Architecture

```solidity
ShieldedAuction Contract
│
├── State Variables
│   ├── seller: address              // Auction creator
│   ├── biddingEnd: uint256          // Deadline timestamp
│   ├── ended: bool                  // Auction ended flag
│   ├── _bids: mapping(address => euint64)  // Encrypted bids
│   ├── _bidders: address[]          // Bidder list
│   ├── _highestBid: euint64         // Encrypted max bid
│   ├── _winnerIndexEnc: euint64     // Encrypted winner index
│   ├── revealPending: bool          // Decryption in progress
│   ├── revealFinalized: bool        // Winner revealed
│   ├── highestBidder: address       // Winner address (after reveal)
│   └── highestBidPlain: uint64      // Winning amount (after reveal)
│
├── Core Functions
│   ├── bid()                        // Submit encrypted bid
│   ├── endAuction()                 // Seller ends auction
│   ├── finalizeReveal()             // Gateway callback
│   └── getWinner()                  // View winner (after reveal)
│
├── View Functions
│   ├── bidderCount()                // Total number of bidders
│   ├── getEncryptedBid()            // User's encrypted bid
│   ├── getHighestBidCiphertext()    // Encrypted max bid
│   └── getBidder()                  // Get bidder by index
│
└── Events
    ├── BidSubmitted                 // Bid recorded
    ├── AuctionClosed                // Auction ended
    └── WinnerRevealed               // Winner announced
```

### Data Flow Diagram

```
User Submits Bid
      │
      ├──────────▶ FHE Encrypt (Client-side)
                  parseEther() → Wei
                        │
                        ├──────────▶ Zama SDK
                                    encrypt64()
                                          │
                                          ├──────────▶ bid()
                                                      (handle, proof)
                                                            │
                                                            ├──────▶ FHE.fromExternal()
                                                                    Validate & Store
                                                                         │
                                                                         ├──────▶ Homomorphic Compare
                                                                                 FHE.gt()
                                                                                   │
                                                                                   ├──────▶ Update Max
                                                                                           FHE.select()
                                                                                             │
                                                                                             ▼
                                                                                        [Encrypted]
                                                                                        on-chain

──────────────────────── AFTER AUCTION ENDS ────────────────────────────────────────

Seller Ends Auction
      │
      ├──────────▶ endAuction()
                        │
                        ├──────────▶ Gateway Request
                                    Decrypt [highestBid, winnerIndex]
                                          │
                                          ├──────────▶ Gateway Processing
                                                      (Asynchronous)
                                                            │
                                                            ├──────▶ finalizeReveal()
                                                                    Callback
                                                                         │
                                                                         ├──────▶ Store Winner
                                                                                 highestBidder
                                                                                 highestBidPlain
                                                                                   │
                                                                                   ▼
                                                                              Winner Revealed!
```

### Technology Stack

#### Smart Contract Layer

| Component | Version | Purpose |
|-----------|---------|---------|
| **Solidity** | 0.8.24 | Smart contract language |
| **Zama fhEVM** | 0.8.0 | FHE-enabled Ethereum Virtual Machine |
| **Hardhat** | Latest | Development environment |
| **Gateway** | Zama FHE Gateway | Asynchronous decryption service |

**FHE Types Used:**
- `euint64` - Encrypted 64-bit unsigned integer for bid amounts
- `externalEuint64` - External encrypted type for user inputs
- `ebool` - Encrypted boolean for comparisons

#### Frontend Layer

| Component | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.x | UI framework |
| **TypeScript** | 5.x | Type safety |
| **Vite** | 5.x | Build tool & dev server |
| **Wagmi** | 2.x | Web3 React hooks |
| **RainbowKit** | 0.12.x | Wallet connection UI |
| **Zama Relayer SDK** | 0.2.0 | FHE encryption client |
| **shadcn/ui** | Latest | UI component library |
| **Tailwind CSS** | 3.x | Styling framework |
| **Viem** | 2.x | Ethereum interactions |

#### Infrastructure

- **Network**: Ethereum Sepolia Testnet
- **Chain ID**: 11155111
- **RPC**: Public Sepolia RPC endpoints
- **Deployment**: Vercel (Frontend) + Hardhat (Contracts)
- **Storage**: On-chain only (no IPFS/centralized DB)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **Yarn** or npm
- **MetaMask** or compatible Web3 wallet
- **Sepolia Testnet ETH** ([Get from faucet](https://sepoliafaucet.com))

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/yourusername/BidMarket.git
cd BidMarket
```

2. **Install dependencies**:
```bash
# Install root dependencies
yarn install

# Install contract dependencies (if needed)
cd contracts
yarn install
cd ..
```

### Configure Environment

1. **Create frontend environment file**:
```bash
cp .env.example .env
```

2. **Edit `.env`**:
```env
VITE_CONTRACT_ADDRESS=0xYourContractAddress
VITE_CHAIN_ID=11155111
```

### Run Development Server

```bash
yarn dev
```

Visit http://localhost:8080

---

## 📖 How It Works

### 1️⃣ **Auction Creation** (Seller)

The seller creates an auction by deploying or initializing a new ShieldedAuction contract:

```solidity
// Set auction parameters
string memory itemName = "Rare NFT #1234";
string memory description = "Limited edition artwork";
string memory imageUrl = "https://...";
uint256 biddingEnd = block.timestamp + 7 days;
```

**Key Points:**
- Seller sets auction duration
- Item details stored on-chain
- Auction becomes immediately active
- Bidding window is immutable once set

### 2️⃣ **Bid Submission** (Bidders)

Users submit encrypted bids through the frontend:

```typescript
// 1. User enters bid amount (e.g., "0.5 ETH")
const bidAmount = "0.5";

// 2. Convert ETH to Wei
const bidInWei = parseEther(bidAmount); // 500000000000000000n

// 3. Encrypt using FHE SDK
const { handle, proof } = await encryptUint64(
  Number(bidInWei),
  contractAddress,
  userAddress
);

// 4. Submit to blockchain
await contract.bid(handle, proof);
```

**Privacy Guarantees:**
- ✅ Encryption happens client-side (in browser)
- ✅ Only encrypted data sent to blockchain
- ✅ No one can see the bid amount
- ✅ One bid per address (prevents gaming)

### 3️⃣ **Homomorphic Comparison** (On-Chain)

The smart contract maintains the highest bid without ever decrypting:

```solidity
// Compare encrypted bids homomorphically
ebool isGreater = FHE.gt(newBid, _highestBid);

// Update highest bid if new bid is greater
_highestBid = FHE.select(isGreater, newBid, _highestBid);

// Update winner index (encrypted)
euint64 newIndex = FHE.asEuint64(bidderCount);
_winnerIndexEnc = FHE.select(isGreater, newIndex, _winnerIndexEnc);
```

**Key Operations:**
- `FHE.gt()` - Greater than comparison on encrypted values
- `FHE.select()` - Choose between encrypted values based on encrypted boolean
- All operations preserve encryption

### 4️⃣ **Auction End** (Seller)

After the bidding deadline, seller ends the auction:

```solidity
function endAuction() external {
    require(msg.sender == seller, "Only seller");
    require(block.timestamp >= biddingEnd, "Bidding not ended");
    require(!ended, "Already ended");

    ended = true;

    if (bidderCount() > 0) {
        // Request decryption via gateway
        uint256[] memory ciphertexts = new uint256[](2);
        ciphertexts[0] = FHE.unwrap(_highestBid);
        ciphertexts[1] = FHE.unwrap(_winnerIndexEnc);

        gatewayContract.requestDecryption(
            ciphertexts,
            this.finalizeReveal.selector,
            ...
        );

        revealPending = true;
    }

    emit AuctionClosed(block.timestamp);
}
```

### 5️⃣ **Winner Reveal** (Gateway Callback)

The FHE gateway asynchronously decrypts and calls back:

```solidity
function finalizeReveal(
    uint256 /*requestID*/,
    uint64 highestBidDecrypted,
    uint64 winnerIndexDecrypted
) public onlyGateway {
    require(revealPending, "No reveal pending");

    // Store plaintext results
    highestBidPlain = highestBidDecrypted;
    uint256 winnerIdx = winnerIndexDecrypted - 1;
    highestBidder = _bidders[winnerIdx];

    // Grant decryption access
    FHE.allow(_highestBid, seller);
    FHE.allow(_highestBid, highestBidder);

    revealFinalized = true;
    revealPending = false;

    emit WinnerRevealed(highestBidder, highestBidPlain);
}
```

**Result:**
- Winner address revealed
- Winning bid amount revealed
- All losing bids remain permanently encrypted
- Winner and seller can verify the encrypted bid

---

## 🔒 Security & Anti-Manipulation

### One Bid Per Address

```solidity
function bid(externalEuint64 calldata number, bytes calldata proof) external {
    require(block.timestamp < biddingEnd, "Bidding ended");
    require(!ended, "Auction already ended");
    require(FHE.isInitialized(_bids[msg.sender]) == false, "Already bid");

    // ... rest of bidding logic
}
```

**Why?**
- ✅ Prevents bid manipulation through multiple submissions
- ✅ Eliminates strategic bid adjustment
- ✅ Forces users to submit their true valuation
- ✅ Reduces gas costs and complexity

### Complete Encryption

**No Information Leakage:**
- Bid amounts encrypted client-side
- Encrypted throughout blockchain storage
- Homomorphic operations preserve encryption
- Only winner revealed at end

**Benefits:**
- Can't see others' bids to adjust yours
- Can't identify winning range until reveal
- True sealed-bid auction mechanism
- Prevents collusion and price fixing

### Immutable Timeline

```solidity
require(block.timestamp < biddingEnd, "Bidding ended");
require(block.timestamp >= biddingEnd, "Bidding not ended");
```

**Guarantees:**
- Auction duration cannot be changed
- No early reveal of winner
- Fair time window for all participants
- Transparent deadline enforcement

---

## 🗺️ Roadmap

### Phase 1: Core Platform ✅ **COMPLETED** (Q4 2025)

- [x] **Smart Contract Development**
  - ShieldedAuction contract with FHE integration
  - Homomorphic bid comparison
  - Gateway-based winner reveal
  - Deployed on Sepolia testnet

- [x] **Frontend Application**
  - Complete React application
  - Wallet integration (MetaMask, OKX, Coinbase)
  - FHE encryption in browser
  - Real-time auction monitoring

- [x] **User Features**
  - Encrypted bid submission
  - Transaction confirmation with Etherscan links
  - Winner reveal display
  - Auction status tracking

### Phase 2: Enhanced Features 🚧 **IN PROGRESS** (Q1 2026)

- [ ] **Multi-Auction Support**
  - Multiple simultaneous auctions
  - Auction listing and filtering
  - Category-based organization
  - Search functionality

- [ ] **NFT Integration**
  - NFT auction support (ERC-721, ERC-1155)
  - Metadata display
  - Automatic winner transfer
  - Collection verification

- [ ] **Bid History & Analytics**
  - Personal auction history
  - Encrypted bid tracking
  - Participation statistics
  - Winner history

- [ ] **Reserve Price Feature**
  - Encrypted reserve price
  - Auction success validation
  - Automatic refunds if reserve not met

- [ ] **Security Audit**
  - Third-party smart contract audit
  - Penetration testing
  - Bug bounty program

### Phase 3: Mainnet & Scale 📋 **PLANNED** (Q2 2026)

- [ ] **Mainnet Deployment**
  - Ethereum mainnet launch
  - Migration from testnet
  - Production monitoring
  - 24/7 support

- [ ] **Advanced Features**
  - Bid withdrawal (before reveal)
  - Auction extensions
  - Multi-signature seller accounts
  - Escrow integration

- [ ] **User Experience**
  - Mobile-responsive improvements
  - Progressive Web App (PWA)
  - Email/push notifications
  - Tutorial system

### Phase 4: Ecosystem Growth 💡 **FUTURE** (Q3-Q4 2026)

- [ ] **Cross-Chain Support**
  - Polygon integration
  - Arbitrum deployment
  - Optimism support
  - Bridge for multi-chain auctions

- [ ] **Mobile Applications**
  - Native iOS app
  - Native Android app
  - Push notifications
  - Biometric authentication

- [ ] **Governance**
  - DAO structure
  - Governance token
  - Community proposals
  - Fee structure voting

- [ ] **Advanced Auction Types**
  - Dutch auctions
  - Reverse auctions
  - Multi-item batch auctions
  - Time-weighted bidding

---

## 📊 Testing

### Unit Tests

The project includes comprehensive unit tests in the `/tests` directory:

```bash
# Run all tests
yarn test

# Run specific test file
yarn test tests/fhe.test.ts

# Run with coverage
yarn test:coverage
```

**Test Coverage:**
- ✅ FHE encryption/decryption
- ✅ Auction creation and validation
- ✅ Bid submission logic
- ✅ Winner determination
- ✅ Utility functions
- ✅ Error handling

See [tests/README.md](tests/README.md) for detailed test documentation.

### Manual Testing Checklist

- [ ] Connect wallet (MetaMask, OKX)
- [ ] View auction details
- [ ] Submit encrypted bid
- [ ] Verify transaction on Etherscan
- [ ] Wait for auction end
- [ ] Seller ends auction
- [ ] Winner reveal displays correctly
- [ ] Verify encrypted bids remain private

---

## 🐛 Troubleshooting

### Issue: FHE Encryption Fails

**Symptoms:**
- "Failed to encrypt bid" error
- Transaction reverts with proof error

**Solutions:**

1. **Check CORS Headers**
   - FHE SDK requires specific CORS headers
   - Verify in browser DevTools Network tab
   - Ensure SharedArrayBuffer is available

2. **Relayer Service Down**
   - Check Zama relayer status
   - Try again in a few minutes
   - Use alternative RPC endpoint

3. **Browser Compatibility**
   - Use Chrome, Firefox, or Edge
   - Enable SharedArrayBuffer
   - Disable restrictive extensions

### Issue: Transaction Fails

**Common Errors:**

| Error | Cause | Solution |
|-------|-------|----------|
| "Bidding ended" | Past deadline | Wait for next auction |
| "Already bid" | Duplicate bid | One bid per address only |
| "Auction already ended" | Seller ended auction | View results instead |

### Issue: Winner Not Showing

**Symptoms:**
- Auction ended but no winner displayed

**Cause:**
- Gateway decryption pending
- Asynchronous reveal in progress

**Solution:**
- Wait 2-5 minutes for gateway callback
- Check `revealPending` status
- Refresh page

### Issue: Wei Conversion Error

**Error:** `"The number 0.1 cannot be converted to a BigInt"`

**Solution:**
- Already fixed in current version
- Ensure using latest code with `parseEther()`

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md).

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `yarn test`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- Follow ESLint configuration
- Use TypeScript for type safety
- Write tests for new features
- Document complex logic
- Use conventional commits

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Zama** - For pioneering FHE technology and fhEVM
- **Ethereum Foundation** - For the Sepolia testnet
- **shadcn/ui** - For beautiful UI components
- **Wagmi & RainbowKit** - For excellent Web3 tooling
- **Viem** - For modern Ethereum interactions

---

## 📞 Support & Community

- **Live Demo**: [https://bidmarket-75smz1lnn-songsus-projects.vercel.app](https://bidmarket-75smz1lnn-songsus-projects.vercel.app)
- **Documentation**: [Zama Docs](https://docs.zama.ai/fhevm)
- **Discord**: [Zama Discord](https://discord.gg/zama)
- **Twitter**: [@ZamaFHE](https://twitter.com/zamafhe)

---

## 🔗 Links

- **Contract**: [View on Sepolia Etherscan](https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS)
- **Zama fhEVM**: [https://docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)
- **Relayer SDK**: [https://github.com/zama-ai/fhevm-relayer-sdk](https://github.com/zama-ai/fhevm-relayer-sdk)

---

<div align="center">

**Built with ❤️ using Zama FHE Technology**

[Website](https://bidmarket-75smz1lnn-songsus-projects.vercel.app) • [GitHub](https://github.com/yourusername/BidMarket) • [Docs](https://docs.zama.ai)

</div>
