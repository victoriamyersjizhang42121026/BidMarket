# BidMarket

BidMarket implements a confidential sealed-bid auction where every offer is
encrypted end-to-end on Zama's fhEVM. Sellers can close the auction and reveal
only the winning bidder and amount, while all losing bids remain secret.

## Contract Overview

- `contracts/BidMarket.sol` exposes the `ShieldedAuction` contract.
- Bids are submitted as `externalEuint64` ciphertexts accompanied by the fhEVM
  input proof; the contract converts them to `euint64` with `FHE.fromExternal`.
- The auction tracks the encrypted maximum (`_highestBid`) and the encrypted
  index of the leading bidder (`_winnerIndexEnc`) using homomorphic comparisons.
- Once bidding ends, the seller triggers `endAuction()`, which requests
  decryption of the highest bid and encrypted winner index through the fhEVM
  gateway. The asynchronous callback `finalizeReveal` finalizes the result and
  grants decryption rights to the seller and winner.

### State highlights

| Variable | Purpose |
| --- | --- |
| `mapping(address => euint64) _bids` | Stores encrypted bids per address. |
| `_highestBid` | Running encrypted maximum maintained with `FHE.select`. |
| `_winnerIndexEnc` | Encrypted 1-based index of the current leader. |
| `revealPending / revealFinalized` | Track winner disclosure lifecycle. |
| `highestBidder / highestBidPlain` | Plaintext winner revealed after callback. |

### Bidding flow

1. `bid()` verifies the auction window, enforces single submission per address,
   and records the encrypted amount.
2. The contract homomorphically updates the running maximum and leader index
   without decrypting bids, ensuring no plaintext leakage on-chain.
3. Each bidder is granted `FHE.allow` on their own ciphertext so they can
   decrypt it later if needed.

### Finalization

- `endAuction()` is restricted to the seller and only callable after
  `biddingEnd`. If at least one bid exists, it produces a gateway request that
  decrypts `[_highestBid, _winnerIndexEnc]`.
- `finalizeReveal()` validates the gateway signatures, decodes the winning bid
  and index, resolves the winner address, and permits both the seller and
  winner to decrypt the encrypted highest bid. If no bids were placed, the
  winner defaults to the zero address with a zero amount.

### Events & errors

- `BidSubmitted`, `AuctionClosed`, and `WinnerRevealed` provide an auditable
  trail of auction progress.
- Custom errors (e.g., `AlreadyBid`, `RevealNotPending`, `WinnerIndexOutOfBounds`)
  keep failure cases explicit.

## Front-end Integration Notes

- Use `bidderCount()` to size client-side pagination of participants.
- `getEncryptedBid(address)` returns each bidder's ciphertext for local display
  or optional off-chain decrypt if the user has access.
- `getHighestBidCiphertext()` becomes callable once the auction ends; it still
  returns the encrypted value until permissions are granted in `finalizeReveal`.
- Poll `revealPending` / `revealFinalized` (or the emitted events) to render the
  winner reveal UX. The `getWinner()` helper provides the plaintext results
  once the callback completes.
- Front-end wallets must be capable of producing `externalEuint64` values and
  associated proofs via the fhEVM SDK.

## Development & Testing

```sh
# install dependencies
npm install

# start the Vite front-end
npm run dev
```

For contract work consider:
- Adding Hardhat/Foundry tests that mock gateway responses to confirm the
  reveal callback resolves correct winners.
- Verifying ties and zero-bid scenarios behave as expected in simulation.
- Stress testing with many bidders to ensure encrypted index selection remains
  within uint64 bounds.

## Changelog

- Rebuilt the auction to maintain the leader entirely in ciphertext, avoiding
  invalid boolean coercions.
- Added asynchronous winner reveal with gateway signature checks and explicit
  permissioning for the seller and winner.
- Hardened state transitions with dedicated errors and ensured stale request
  data is cleared after refunds or callbacks.
