// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, ebool, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title ShieldedAuction – Confidential sealed-bid auction leveraging Zama's fhEVM 0.9.1
/// @notice Bidders submit encrypted amounts; the contract tracks the maximum entirely in ciphertext.
///         When the seller ends the auction, the encrypted values are marked for public decryption.
///         Decryption is performed off-chain using the relayer SDK.
contract ShieldedAuction is ZamaEthereumConfig {
    address public immutable seller;
    uint256 public immutable biddingEnd;

    // Auction item details (stored in plaintext)
    string public itemName;
    string public itemDescription;
    string public itemImageUrl;

    bool public ended;
    bool public revealReady;

    mapping(address => euint64) private _bids;
    mapping(address => bool) private _hasBid;
    address[] private _bidders;

    euint64 private _highestBid;
    euint64 private _winnerIndexEnc; // 1-based index of the winning bidder (0 => none)

    // Revealed values (set off-chain after decryption)
    address public highestBidder;
    uint64 public highestBidPlain;
    uint64 public winnerIndexPlain;

    error AuctionStillActive();
    error AuctionAlreadyEnded();
    error AlreadyBid();
    error Unauthorized();
    error RevealNotReady();
    error WinnerIndexOutOfBounds();

    event BidSubmitted(address indexed bidder);
    event AuctionClosed();
    event WinnerRevealed(address indexed bidder, uint64 amount);
    event DecryptionReady(bytes32 highestBidHandle, bytes32 winnerIndexHandle);

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

    /// @notice Ends the auction and marks encrypted values for public decryption.
    /// @dev Callable by the seller once the bidding window has closed.
    ///      In v0.9.1, decryption is performed off-chain using the relayer SDK.
    function endAuction() external {
        if (msg.sender != seller) revert Unauthorized();
        if (block.timestamp < biddingEnd) revert AuctionStillActive();
        if (ended) revert AuctionAlreadyEnded();

        ended = true;

        if (_bidders.length == 0) {
            revealReady = true;
            highestBidder = address(0);
            highestBidPlain = 0;
            winnerIndexPlain = 0;
            emit AuctionClosed();
            emit WinnerRevealed(address(0), 0);
            return;
        }

        // Mark encrypted values as publicly decryptable for off-chain decryption
        FHE.makePubliclyDecryptable(_highestBid);
        FHE.makePubliclyDecryptable(_winnerIndexEnc);

        // Allow seller to access the encrypted values
        FHE.allow(_highestBid, seller);
        FHE.allow(_winnerIndexEnc, seller);

        emit AuctionClosed();
        emit DecryptionReady(
            FHE.toBytes32(_highestBid),
            FHE.toBytes32(_winnerIndexEnc)
        );
    }

    /// @notice Finalize the reveal with decrypted values (called by seller after off-chain decryption)
    /// @param _highestBidValue The decrypted highest bid value
    /// @param _winnerIndexValue The decrypted winner index value
    function finalizeReveal(uint64 _highestBidValue, uint64 _winnerIndexValue) external {
        if (msg.sender != seller) revert Unauthorized();
        if (!ended) revert AuctionStillActive();
        if (revealReady) revert RevealNotReady();

        highestBidPlain = _highestBidValue;
        winnerIndexPlain = _winnerIndexValue;
        revealReady = true;

        if (_winnerIndexValue == 0) {
            highestBidder = address(0);
        } else {
            if (_winnerIndexValue > _bidders.length) revert WinnerIndexOutOfBounds();
            highestBidder = _bidders[_winnerIndexValue - 1];
            FHE.allow(_highestBid, highestBidder);
        }

        emit WinnerRevealed(highestBidder, _highestBidValue);
    }

    /// @notice Returns the encrypted bid submitted by `bidder`.
    function getEncryptedBid(address bidder) external view returns (euint64) {
        return _bids[bidder];
    }

    /// @notice Returns the encrypted highest bid handle for off-chain decryption.
    /// @dev Accessible after the auction is ended.
    function getHighestBidHandle() external view returns (bytes32) {
        if (!ended) revert AuctionStillActive();
        return FHE.toBytes32(_highestBid);
    }

    /// @notice Returns the encrypted winner index handle for off-chain decryption.
    /// @dev Accessible after the auction is ended.
    function getWinnerIndexHandle() external view returns (bytes32) {
        if (!ended) revert AuctionStillActive();
        return FHE.toBytes32(_winnerIndexEnc);
    }

    /// @notice Returns the current winner information (only once the reveal is finalized).
    function getWinner() external view returns (address winner, uint64 bidAmount) {
        if (!revealReady) revert RevealNotReady();
        return (highestBidder, highestBidPlain);
    }

    /// @notice Returns the number of bidders.
    function bidderCount() external view returns (uint256) {
        return _bidders.length;
    }

    /// @notice Returns all bidder addresses.
    function getBidders() external view returns (address[] memory) {
        return _bidders;
    }

    /// @notice Check if a specific address has bid.
    function hasBid(address bidder) external view returns (bool) {
        return _hasBid[bidder];
    }

    /// @notice Returns auction status.
    function getAuctionStatus() external view returns (
        bool isEnded,
        bool isRevealReady,
        uint256 totalBidders,
        uint256 timeRemaining
    ) {
        isEnded = ended;
        isRevealReady = revealReady;
        totalBidders = _bidders.length;
        timeRemaining = block.timestamp >= biddingEnd ? 0 : biddingEnd - block.timestamp;
    }
}
