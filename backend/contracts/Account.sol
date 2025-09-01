// contracts/Account.sol
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./AccountFactory.sol";

contract Account is Ownable, ReentrancyGuard {
    event Received(address from, uint256 amount);
    event Deposited(address from, uint256 amount, string method);
    event Withdrawn(address to, uint256 amount);
    event Transfer(address from, address to, uint256 amount, uint256 fee);
    event SavingsDeposited(uint256 amount, uint256 newBalance);
    event SavingsWithdrawn(uint256 amount, uint256 newBalance);

    address public immutable factoryAddress;
    uint256 public savingsBalance;
    
    // Maximum savings percentage to prevent locking all funds
    uint256 public constant MAX_SAVINGS_PERCENTAGE = 9000; // 90%

    constructor(address _owner, address _factoryAddress) Ownable(_owner) {
        require(_owner != address(0), "Invalid owner address");
        require(_factoryAddress != address(0), "Invalid factory address");
        factoryAddress = _factoryAddress;
    }

    // Transfer funds to another user's account
    function transfer(uint256 _amount, address _toUserWallet) external onlyOwner nonReentrant {
        require(_toUserWallet != address(0), "Invalid recipient address");
        require(_toUserWallet != msg.sender, "Cannot transfer to yourself");
        require(_amount > 0, "Amount must be greater than 0");
        
        AccountFactory factory = AccountFactory(factoryAddress);
        address recipientContractAddress = factory.userAccounts(_toUserWallet);
        require(recipientContractAddress != address(0), "Recipient account not found");
        
        uint256 fee = factory.transactionFee();
        uint256 totalRequired = _amount + fee;
        uint256 availableBalance = getAvailableBalance();
        
        require(totalRequired <= availableBalance, "Insufficient available balance");
        
        // Transfer fee to treasury
        payable(factory.treasury()).transfer(fee);
        // Transfer amount to recipient
        payable(recipientContractAddress).transfer(_amount);
        
        emit Transfer(msg.sender, _toUserWallet, _amount, fee);
    }

    // Move funds from main balance to savings
    function moveToSavings(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be greater than 0");
        uint256 availableBalance = getAvailableBalance();
        require(_amount <= availableBalance, "Insufficient available balance");
        
        // Ensure savings doesn't exceed maximum percentage
        uint256 totalBalance = getBalance();
        uint256 newSavingsBalance = savingsBalance + _amount;
        require(
            newSavingsBalance <= (totalBalance * MAX_SAVINGS_PERCENTAGE) / 10000, 
            "Savings would exceed maximum percentage"
        );
        
        savingsBalance = newSavingsBalance;
        emit SavingsDeposited(_amount, savingsBalance);
    }

    // Withdraw funds from savings to main balance
    function withdrawFromSavings(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be greater than 0");
        require(_amount <= savingsBalance, "Insufficient savings balance");
        
        savingsBalance -= _amount;
        emit SavingsWithdrawn(_amount, savingsBalance);
    }

    // Deposit funds into the account
    function deposit() external payable onlyOwner {
        require(msg.value > 0, "Must send ETH to deposit");
        emit Deposited(msg.sender, msg.value, "deposit()");
    }

    // Withdraw funds from the account
    function withdraw(uint256 _amount) external onlyOwner nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        uint256 availableBalance = getAvailableBalance();
        require(_amount <= availableBalance, "Insufficient available balance");
        
        payable(owner()).transfer(_amount);
        emit Withdrawn(owner(), _amount);
    }

    // Emergency withdrawal of all available funds
    function emergencyWithdraw() external onlyOwner nonReentrant {
        uint256 availableBalance = getAvailableBalance();
        require(availableBalance > 0, "No funds available");
        
        payable(owner()).transfer(availableBalance);
        emit Withdrawn(owner(), availableBalance);
    }

    // Get total balance of the contract
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // Get available balance (total - savings)
    function getAvailableBalance() public view returns (uint256) {
        uint256 totalBalance = getBalance();
        return totalBalance > savingsBalance ? totalBalance - savingsBalance : 0;
    }

    // Get savings balance
    function getSavingsBalance() external view returns (uint256) {
        return savingsBalance;
    }

    // Receive function for incoming ETH
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    // Fallback function
    fallback() external payable {
        emit Received(msg.sender, msg.value);
    }
}