// contracts/AccountFactory.sol
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./Account.sol";

contract AccountFactory {
    address public treasury;
    uint256 public transactionFee = 0.0001 ether;

    constructor() {
        treasury = msg.sender;
    }

    event AccountCreated(address indexed owner, address indexed accountAddress, string username);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event TransactionFeeUpdated(uint256 oldFee, uint256 newFee);

    mapping(address => address) public userAccounts;
    mapping(string => address) public usernameToAddress;
    mapping(address => string) public addressToUsername;

    modifier onlyTreasury() {
        require(msg.sender == treasury, "Only treasury can call this function");
        _;
    }

    // Create a new Account contract for the user
    function createAccount(string calldata _username) external {
        require(userAccounts[msg.sender] == address(0), "User already has an account");
        require(usernameToAddress[_username] == address(0), "Username is already taken");
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(bytes(_username).length <= 32, "Username too long");
        
        Account newAccount = new Account(msg.sender, address(this));
        userAccounts[msg.sender] = address(newAccount);
        usernameToAddress[_username] = msg.sender;
        addressToUsername[msg.sender] = _username;
        
        emit AccountCreated(msg.sender, address(newAccount), _username);
    }

    // Get user's account address
    function getMyAccountAddress(address _user) external view returns (address) {
        return userAccounts[_user];
    }

    // Get username by address
    function getUsername(address _user) external view returns (string memory) {
        return addressToUsername[_user];
    }

    // Update treasury address (only current treasury)
    function updateTreasury(address _newTreasury) external onlyTreasury {
        require(_newTreasury != address(0), "Invalid treasury address");
        address oldTreasury = treasury;
        treasury = _newTreasury;
        emit TreasuryUpdated(oldTreasury, _newTreasury);
    }

    // Update transaction fee (only treasury)
    function updateTransactionFee(uint256 _newFee) external onlyTreasury {
        require(_newFee <= 0.01 ether, "Fee too high"); // Max 0.01 ETH
        uint256 oldFee = transactionFee;
        transactionFee = _newFee;
        emit TransactionFeeUpdated(oldFee, _newFee);
    }

    // Check if user has an account
    function hasAccount(address _user) external view returns (bool) {
        return userAccounts[_user] != address(0);
    }
}