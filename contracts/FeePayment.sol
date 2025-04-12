// SPDX-License-Identifier:  GPL-3.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Interface to interact with the IdentityNFT contract.
interface IIdentityNFT {
    function identityTokenByOwner(address owner) external view returns (uint256);
}

contract FeePayment is Ownable {
    IIdentityNFT public identityNFT;

    // Fee amount to be paid (in wei).
    uint256 public feeAmount;

    // Fee cycle: users are marked as having paid for the cycle.
    uint256 public feeCycle;
    mapping(address => uint256) public feePaidCycle;

    event FeePaid(uint256 paymentId, address payer, uint256 amount);
    event FeeAmountSet(uint256 newFeeAmount);
    event FeesReset(uint256 newFeeCycle, uint256 newFeeAmount);

    uint256 public paymentCounter;
    
    /// @notice Constructor initializing IdentityNFT reference and initial fee amount.
    constructor(address _identityNFTAddress, uint256 _initialFeeAmount) Ownable(msg.sender) {
        identityNFT = IIdentityNFT(_identityNFTAddress);
        feeAmount = _initialFeeAmount;
        feeCycle = 1; // Starting fee cycle.
        emit FeeAmountSet(_initialFeeAmount);
    }

    /// @notice Set the fee amount (only owner).
    function setFee(uint256 _feeAmount) external onlyOwner {
        feeAmount = _feeAmount;
        emit FeeAmountSet(_feeAmount);
    }

    /// @notice Pay the semester fee.
    function payFee() public payable {
        require(identityNFT.identityTokenByOwner(msg.sender) != 0, "No Identity NFT found");
        require(feePaidCycle[msg.sender] != feeCycle, "Fee already paid for this cycle");
        require(msg.value == feeAmount, "Please pay the exact fee amount");

        paymentCounter++;
        feePaidCycle[msg.sender] = feeCycle;
        emit FeePaid(paymentCounter, msg.sender, msg.value);
    }

    /// @notice Check if an account has paid the fee for the current cycle.
    function isFeePaid(address account) external view returns (bool) {
        return feePaidCycle[account] == feeCycle;
    }

    /// @notice Reset fees for a new cycle (e.g., new semester) and set a new fee amount.
    function resetFees(uint256 _newFeeAmount) external onlyOwner {
        feeCycle++; // Advances the fee cycle.
        feeAmount = _newFeeAmount;
        emit FeesReset(feeCycle, _newFeeAmount);
    }
}
