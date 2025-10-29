// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, ebool, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title ShieldedAuction – Confidential sealed-bid auction leveraging Zama's fhEVM
/// @notice Bidders submit encrypted amounts; the contract tracks the maximum entirely in ciphertext.
///         When the seller ends the auction, the encrypted winner index and bid are decrypted
///         asynchronously via the fhEVM gateway, revealing only the winning pair.
contract ShieldedAuction is SepoliaConfig {
    address public immutable seller;
    uint256 public immutable biddingEnd;

    // Auction item details (stored in plaintext)
    string public itemName;
    string public itemDescription;
    string public itemImageUrl;

    bool public ended;
    bool public revealPending;
    bool public revealFinalized;

    mapping(address => euint64) private _bids;
    mapping(address => bool) private _hasBid;
    address[] private _bidders;

    euint64 private _highestBid;
    euint64 private _winnerIndexEnc; // 1-based index of the winning bidder (0 => none)

    uint256 public revealRequestId;
    address public highestBidder;
    uint64 public highestBidPlain;
    uint64 public winnerIndexPlain;

    error AuctionStillActive();
    error AuctionAlreadyEnded();
    error AlreadyBid();
    error Unauthorized();
    error RevealInProgress();
    error RevealNotPending();
    error RevealNotReady();
    error InvalidReveal();
    error WinnerIndexOutOfBounds();

    event BidSubmitted(address indexed bidder);
    event AuctionClosed(uint256 revealRequestId);
    event WinnerRevealed(address indexed bidder, uint64 amount);

    constructor(
        uint256 biddingTime,
        string memory _itemName,
        string memory _itemDescription,
        string memory _itemImageUrl
    ) {
        seller = msg.sender;
        biddingEnd = block.timestamp + biddingTime;

        itemName = _itemName;
        itemDescription = _itemDescription;
        itemImageUrl = _itemImageUrl;

        _highestBid = FHE.asEuint64(0);
        _winnerIndexEnc = FHE.asEuint64(0);

        FHE.allowThis(_highestBid);
        FHE.allowThis(_winnerIndexEnc);
    }

    /// @notice Submit a sealed bid.
    /// @dev Each address can bid once. The amount stays encrypted on-chain.
    function bid(externalEuint64 encryptedAmount, bytes calldata inputProof) external {
        if (block.timestamp >= biddingEnd) revert AuctionAlreadyEnded();
        if (ended) revert AuctionAlreadyEnded();
        if (_hasBid[msg.sender]) revert AlreadyBid();

        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        _bids[msg.sender] = amount;
        _hasBid[msg.sender] = true;
        _bidders.push(msg.sender);

        FHE.allowThis(amount);
        FHE.allow(amount, msg.sender);

        ebool isHigher = FHE.gt(amount, _highestBid);
        _highestBid = FHE.select(isHigher, amount, _highestBid);
        FHE.allowThis(_highestBid);

        uint64 indexPlain = uint64(_bidders.length); // fits in uint64 for realistic auction sizes
        euint64 indexEnc = FHE.asEuint64(indexPlain);
        _winnerIndexEnc = FHE.select(isHigher, indexEnc, _winnerIndexEnc);
        FHE.allowThis(_winnerIndexEnc);

        emit BidSubmitted(msg.sender);
    }

    /// @notice Ends the auction and requests a reveal of the winning bid + bidder index.
    /// @dev Callable by the seller once the bidding window has closed.
    function endAuction() external returns (uint256 requestId) {
        if (msg.sender != seller) revert Unauthorized();
        if (block.timestamp < biddingEnd) revert AuctionStillActive();
        if (ended) revert AuctionAlreadyEnded();
        if (revealPending) revert RevealInProgress();

        ended = true;

        if (_bidders.length == 0) {
            revealFinalized = true;
            highestBidder = address(0);
            highestBidPlain = 0;
            winnerIndexPlain = 0;
            FHE.allow(_highestBid, seller);
            emit AuctionClosed(0);
            emit WinnerRevealed(address(0), 0);
            return 0;
        }

        bytes32[] memory cts = new bytes32[](2);
        cts[0] = FHE.toBytes32(_highestBid);
        cts[1] = FHE.toBytes32(_winnerIndexEnc);

        requestId = FHE.requestDecryption(cts, this.finalizeReveal.selector);
        revealPending = true;
        revealRequestId = requestId;

        emit AuctionClosed(requestId);
    }

    /// @notice Callback invoked by the fhEVM gateway once the winning pair is decrypted.
    function finalizeReveal(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        if (!revealPending) revert RevealNotPending();
        if (requestId != revealRequestId) revert InvalidReveal();

        FHE.checkSignatures(requestId, cleartexts, decryptionProof);
        (uint64 highestBidValue, uint64 winnerIndexValue) = abi.decode(cleartexts, (uint64, uint64));

        revealPending = false;
        revealFinalized = true;
        revealRequestId = 0;
        highestBidPlain = highestBidValue;
        winnerIndexPlain = winnerIndexValue;

        if (winnerIndexValue == 0) {
            highestBidder = address(0);
        } else {
            if (winnerIndexValue > _bidders.length) revert WinnerIndexOutOfBounds();
            highestBidder = _bidders[winnerIndexValue - 1];
            FHE.allow(_highestBid, highestBidder);
        }

        FHE.allow(_highestBid, seller);
        emit WinnerRevealed(highestBidder, highestBidValue);
    }

    /// @notice Returns the encrypted bid submitted by `bidder`.
    function getEncryptedBid(address bidder) external view returns (euint64) {
        return _bids[bidder];
    }

    /// @notice Returns the encrypted highest bid tracked on-chain.
    /// @dev Accessible after the auction is ended to avoid leaking activity mid-auction.
    function getHighestBidCiphertext() external view returns (euint64) {
        if (!ended) revert AuctionStillActive();
        return _highestBid;
    }

    /// @notice Returns the current winner information (only once the reveal is finalized).
    function getWinner() external view returns (address winner, uint64 bid) {
        if (!revealFinalized) revert RevealNotReady();
        return (highestBidder, highestBidPlain);
    }

    /// @notice Returns the number of bidders.
    function bidderCount() external view returns (uint256) {
        return _bidders.length;
    }
}
