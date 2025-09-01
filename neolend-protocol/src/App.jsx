import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Wallet, DollarSign, PiggyBank, TrendingUp, AlertTriangle, Plus, Minus, Send, Eye, EyeOff, ExternalLink, Loader2 } from 'lucide-react';

// --- 1. YOUR DEPLOYED CONTRACT ADDRESSES ---
const CONTRACT_ADDRESSES = {
    ACCOUNT_FACTORY: '0x628f1CbcA446285f8D7F6b73CAFD12f25fd43Ea1',
    LENDING: '0x90f53Dc8E149638EDDE4a8dD024b5f2Dc4E6a631',
    DETH: '0x5DbC711D7bEb1cd273E925224606eA5f73dfefA1'
};

// --- 2. PASTE YOUR CONTRACT ABIs HERE ---
const ACCOUNT_FACTORY_ABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "accountAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "username",
          "type": "string"
        }
      ],
      "name": "AccountCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "oldFee",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newFee",
          "type": "uint256"
        }
      ],
      "name": "TransactionFeeUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "oldTreasury",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newTreasury",
          "type": "address"
        }
      ],
      "name": "TreasuryUpdated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "addressToUsername",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_username",
          "type": "string"
        }
      ],
      "name": "createAccount",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getMyAccountAddress",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getUsername",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "hasAccount",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "transactionFee",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "treasury",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_newFee",
          "type": "uint256"
        }
      ],
      "name": "updateTransactionFee",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_newTreasury",
          "type": "address"
        }
      ],
      "name": "updateTreasury",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "userAccounts",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "name": "usernameToAddress",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];
const LENDING_ABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_dETH",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_ethUsdFeed",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ReentrancyGuardReentrantCall",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        }
      ],
      "name": "SafeERC20FailedOperation",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Borrowed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "CollateralDeposited",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "feed",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "isSupported",
          "type": "bool"
        }
      ],
      "name": "CollateralSupported",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "CollateralWithdrawn",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "dETHMinted",
          "type": "uint256"
        }
      ],
      "name": "DepositedETH",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "liquidator",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "repaid",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "collateralSeized",
          "type": "uint256"
        }
      ],
      "name": "Liquidated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "repaid",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "remainingDebt",
          "type": "uint256"
        }
      ],
      "name": "Repaid",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "dETHBurned",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "WithdrawnETH",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "LIQ_BONUS_BPS",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "LIQ_THRESHOLD_BPS",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "LTV_BPS",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "PRECISION",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amountWei",
          "type": "uint256"
        }
      ],
      "name": "borrow",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "borrowBalances",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "collateralBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "collateralList",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "dETHToken",
      "outputs": [
        {
          "internalType": "contract DETH",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "depositCollateral",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "depositInPool",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "ethUsdFeed",
      "outputs": [
        {
          "internalType": "contract AggregatorV3Interface",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getCollateralList",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getETHPriceUSD",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getHealthFactor",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getPoolBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        }
      ],
      "name": "getTokenPriceUSD",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTotalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getUserBorrowCapacity",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getUserCollateralValueETH",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getUtilizationRate",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "liquidate",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "priceFeed",
      "outputs": [
        {
          "internalType": "contract AggregatorV3Interface",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "repay",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "supported",
          "type": "bool"
        },
        {
          "internalType": "address",
          "name": "tokenUsdFeed",
          "type": "address"
        }
      ],
      "name": "setSupportedCollateral",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "supportedCollateral",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "withdrawCollateral",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "dETHAmount",
          "type": "uint256"
        }
      ],
      "name": "withdrawFromPool",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ];
const ACCOUNT_ABI =[
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_factoryAddress",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ReentrancyGuardReentrantCall",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "method",
          "type": "string"
        }
      ],
      "name": "Deposited",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Received",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newBalance",
          "type": "uint256"
        }
      ],
      "name": "SavingsDeposited",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newBalance",
          "type": "uint256"
        }
      ],
      "name": "SavingsWithdrawn",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "fee",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Withdrawn",
      "type": "event"
    },
    {
      "stateMutability": "payable",
      "type": "fallback"
    },
    {
      "inputs": [],
      "name": "MAX_SAVINGS_PERCENTAGE",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "deposit",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "emergencyWithdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "factoryAddress",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAvailableBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getSavingsBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "moveToSavings",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "savingsBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_toUserWallet",
          "type": "address"
        }
      ],
      "name": "transfer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "withdrawFromSavings",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ];
const DETH_ABI =   [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "allowance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "needed",
          "type": "uint256"
        }
      ],
      "name": "ERC20InsufficientAllowance",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "balance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "needed",
          "type": "uint256"
        }
      ],
      "name": "ERC20InsufficientBalance",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "approver",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidApprover",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidReceiver",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidSender",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidSpender",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "burn",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "mint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "minter",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_minter",
          "type": "address"
        }
      ],
      "name": "setMinter",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
const ERC20_ABI =[
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "allowance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "needed",
          "type": "uint256"
        }
      ],
      "name": "ERC20InsufficientAllowance",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "balance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "needed",
          "type": "uint256"
        }
      ],
      "name": "ERC20InsufficientBalance",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "approver",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidApprover",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidReceiver",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidSender",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidSpender",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]; // You can reuse the DETH_ABI here

// Wallet connection hook with the fix
const useWallet = () => {
    const [account, setAccount] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [chainId, setChainId] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);

    const isMetaMaskInstalled = () => {
        return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
    };

    const connect = async () => {
        if (!isMetaMaskInstalled()) {
            alert('MetaMask is not installed. Please install MetaMask to continue.');
            window.open('https://metamask.io/download/', '_blank');
            return;
        }

        setIsConnecting(true);
        try {
            const newProvider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await newProvider.send("eth_requestAccounts", []);
            
            if (accounts.length > 0) {
                const newSigner = await newProvider.getSigner();
                const network = await newProvider.getNetwork();
                setProvider(newProvider);
                setSigner(newSigner);
                setAccount(accounts[0]);
                setChainId(Number(network.chainId));
            }
        } catch (error) {
            console.error('Failed to connect wallet:', error);
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnect = () => {
        setAccount(null);
        setChainId(null);
        setProvider(null);
        setSigner(null);
    };

    const switchToSepolia = async () => {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0xaa36a7',
                            chainName: 'Sepolia Test Network',
                            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18, },
                            rpcUrls: ['https://sepolia.infura.io/v3/'],
                            blockExplorerUrls: ['https://sepolia.etherscan.io/'],
                        }],
                    });
                } catch (addError) {
                    console.error('Failed to add Sepolia network:', addError);
                }
            }
        }
    };
    
    const getBalance = async () => {
        if (!provider || !account) return '0';
        try {
            const balance = await provider.getBalance(account);
            return ethers.formatEther(balance);
        } catch (error) {
            console.error('Failed to get balance:', error);
            return '0';
        }
    };

    useEffect(() => {
        if (!isMetaMaskInstalled()) return;

        // Function to check for an existing connection without a pop-up
        const checkConnection = async () => {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    // If already connected, set up the provider and state
                    const newProvider = new ethers.BrowserProvider(window.ethereum);
                    const newSigner = await newProvider.getSigner();
                    const network = await newProvider.getNetwork();
                    
                    setProvider(newProvider);
                    setSigner(newSigner);
                    setAccount(accounts[0]);
                    setChainId(Number(network.chainId));
                }
            } catch (err) {
                console.error("Error checking for existing connection:", err);
            }
        };

        checkConnection();

        const handleAccountsChanged = (accounts) => {
            if (accounts.length === 0) disconnect();
            else window.location.reload(); // Reload to re-establish state
        };
        const handleChainChanged = () => window.location.reload();

        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        return () => {
            if (window.ethereum.removeListener) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            }
        };
    }, []);

    return {
        account,
        chainId,
        provider,
        signer,
        isConnecting,
        isConnected: !!account,
        connect,
        disconnect,
        switchToSepolia,
        getBalance,
        isMetaMaskInstalled: isMetaMaskInstalled(),
    };
};

const DeFiDApp = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [balanceVisible, setBalanceVisible] = useState(true);
    const [txLoading, setTxLoading] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        username: '', transferAmount: '', transferRecipient: '', savingsAmount: '',
        depositAmount: '', withdrawAmount: '', borrowAmount: '', repayAmount: '', collateralAmount: '',
        collateralToken: '0x779877A7B0D9E8603169DdbD7836e478b4624789' // Default to LINK on Sepolia
    });

    // Contract instances
    const [contracts, setContracts] = useState({});
    
    // Live on-chain data state
    const [liveData, setLiveData] = useState({
        walletBalance: '0',
        userAccountAddress: null,
        accountBalance: '0',
        savingsBalance: '0',
        borrowBalance: '0',
        healthFactor: '0',
        collateralValue: '0',
        dethBalance: '0',
    });

    const wallet = useWallet();

    const fetchContractData = useCallback(async () => {
        if (!wallet.signer) return;
        setIsFetchingData(true);
        try {
            const { signer } = wallet;
            const factory = new ethers.Contract(CONTRACT_ADDRESSES.ACCOUNT_FACTORY, ACCOUNT_FACTORY_ABI, signer);
            const lending = new ethers.Contract(CONTRACT_ADDRESSES.LENDING, LENDING_ABI, signer);
            const deth = new ethers.Contract(CONTRACT_ADDRESSES.DETH, DETH_ABI, signer);

            const userAddress = signer.address;
            const userAccountAddress = await factory.userAccounts(userAddress);
            
            let userAccount = null;
            let accountBalance = '0';
            let savingsBalance = '0';

            if (userAccountAddress !== ethers.ZeroAddress) {
                userAccount = new ethers.Contract(userAccountAddress, ACCOUNT_ABI, signer);
                const accBal = await userAccount.getBalance();
                const savBal = await userAccount.savingsBalance();
                accountBalance = ethers.formatEther(accBal);
                savingsBalance = ethers.formatEther(savBal);
            }

            const [walletBal, borrowBal, hf, colVal, dethBal] = await Promise.all([
                wallet.getBalance(),
                lending.borrowBalances(userAddress),
                lending.getHealthFactor(userAddress),
                lending.getUserCollateralValueETH(userAddress),
                deth.balanceOf(userAddress)
            ]);
            
            setContracts({ factory, lending, deth, userAccount });

            setLiveData({
                walletBalance: parseFloat(walletBal).toFixed(4),
                userAccountAddress,
                accountBalance: parseFloat(accountBalance).toFixed(4),
                savingsBalance: parseFloat(savingsBalance).toFixed(4),
                borrowBalance: ethers.formatEther(borrowBal),
                healthFactor: ethers.formatEther(hf),
                collateralValue: ethers.formatEther(colVal),
                dethBalance: ethers.formatEther(dethBal),
            });

        } catch (error) {
            console.error("Failed to fetch contract data:", error);
        } finally {
            setIsFetchingData(false);
        }
    }, [wallet.signer]);

    useEffect(() => {
        if (wallet.isConnected) {
            fetchContractData();
        }
    }, [wallet.isConnected, fetchContractData]);
    
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    
    const executeTransaction = async (txFunction, successMessage) => {
        if (!wallet.isConnected) return alert('Please connect your wallet first.');
        setTxLoading(true);
        try {
            const tx = await txFunction();
            await tx.wait();
            alert(successMessage);
            fetchContractData(); // Refresh data after transaction
        } catch (error) {
            console.error("Transaction failed:", error);
            alert(`Transaction failed: ${error.reason || error.message}`);
        } finally {
            setTxLoading(false);
        }
    };

    // --- Contract Interaction Handlers ---
    const handleCreateAccount = () => executeTransaction(
        () => contracts.factory.createAccount(formData.username),
        "Account created successfully!"
    );

    const handleAccountDeposit = () => executeTransaction(
        () => contracts.userAccount.deposit({ value: ethers.parseEther(formData.depositAmount) }),
        "Deposit to account successful!"
    );

    const handleAccountWithdraw = () => executeTransaction(
        () => contracts.userAccount.withdraw(ethers.parseEther(formData.withdrawAmount)),
        "Withdraw from account successful!"
    );
    
    const handleTransfer = () => executeTransaction(
        () => contracts.userAccount.transfer(ethers.parseEther(formData.transferAmount), formData.transferRecipient),
        "Transfer successful!"
    );
    
    const handleMoveToSavings = () => executeTransaction(
        () => contracts.userAccount.moveToSavings(ethers.parseEther(formData.savingsAmount)),
        "Moved to savings successfully!"
    );

    const handleWithdrawFromSavings = () => executeTransaction(
        () => contracts.userAccount.withdrawFromSavings(ethers.parseEther(formData.savingsAmount)),
        "Withdrew from savings successfully!"
    );

    const handleCollateralDeposit = async () => {
        setTxLoading(true);
        try {
            const collateralToken = new ethers.Contract(formData.collateralToken, ERC20_ABI, wallet.signer);
            const amount = ethers.parseEther(formData.collateralAmount);

            // 1. Approve the lending contract to spend the collateral
            const approveTx = await collateralToken.approve(CONTRACT_ADDRESSES.LENDING, amount);
            await approveTx.wait();
            alert("Approval successful! Now depositing collateral...");

            // 2. Deposit the collateral
            const depositTx = await contracts.lending.depositCollateral(formData.collateralToken, amount);
            await depositTx.wait();

            alert("Collateral deposited successfully!");
            fetchContractData();
        } catch (error) {
            console.error("Collateral deposit failed:", error);
            alert(`Collateral deposit failed: ${error.reason || error.message}`);
        } finally {
            setTxLoading(false);
        }
    };
    
    const handlePoolDeposit = () => executeTransaction(
        () => contracts.lending.depositInPool({ value: ethers.parseEther(formData.depositAmount) }),
        "Deposited to pool successfully!"
    );
    
    const handleBorrow = () => executeTransaction(
        () => contracts.lending.borrow(ethers.parseEther(formData.borrowAmount)),
        "Borrow successful!"
    );

    const handleRepay = () => executeTransaction(
        () => contracts.lending.repay({ value: ethers.parseEther(formData.repayAmount) }),
        "Repay successful!"
    );

    // --- UI Rendering ---

    if (!wallet.isConnected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-4 text-white">
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full text-center border border-white/20">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">DeFi Protocol</h1>
                        <p className="text-white/70">Connect your wallet to get started</p>
                    </div>

                    {!wallet.isMetaMaskInstalled ? (
                        <button
                            onClick={() => window.open('https://metamask.io/download/', '_blank')}
                            className="w-full bg-orange-500 text-white py-4 px-6 rounded-xl font-semibold"
                        >
                            <ExternalLink className="inline-block mr-2" size={20} />
                            Install MetaMask
                        </button>
                    ) : (
                        <button
                            onClick={wallet.connect}
                            disabled={wallet.isConnecting}
                            className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Wallet className="inline-block mr-2" size={20} />
                            {wallet.isConnecting ? 'Connecting...' : 'Connect MetaMask'}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white font-sans">
            {txLoading && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="flex flex-col items-center gap-4 text-white">
                        <Loader2 className="animate-spin" size={48} />
                        <p className="text-lg font-semibold">Processing Transaction...</p>
                        <p className="text-sm text-white/70">Please confirm in your wallet and wait for confirmation.</p>
                    </div>
                </div>
            )}
            
            {/* Header */}
            <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-white">DeFi Protocol</h1>
                    <div className="flex items-center space-x-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${wallet.chainId === 11155111 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                            {wallet.chainId === 11155111 ? 'Sepolia' : `Wrong Network (ID: ${wallet.chainId})`}
                        </div>
                        <div className="bg-white/10 rounded-lg px-4 py-2">
                            <span className="text-white/70 text-sm">Balance: </span>
                            <span className="text-white font-bold">{liveData.walletBalance} ETH</span>
                        </div>
                        <div className="bg-white/10 rounded-lg px-4 py-2">
                            <span className="text-white/70 text-sm">Connected: </span>
                            <span className="text-white font-mono">
                                {wallet.account?.slice(0, 6)}...{wallet.account?.slice(-4)}
                            </span>
                        </div>
                        <button onClick={wallet.disconnect} className="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors">
                            Disconnect
                        </button>
                    </div>
                </div>
            </header>
            

            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex space-x-1 bg-white/10 backdrop-blur-lg rounded-xl p-1">
                <button onClick={() => setActiveTab('dashboard')} className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'dashboard' ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'}`}>Dashboard</button>
                <button onClick={() => setActiveTab('account')} className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'account' ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'}`}>My Account</button>
                <button onClick={() => setActiveTab('lending')} className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'lending' ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'}`}>Lending Pool</button>
                <button onClick={() => setActiveTab('savings')} className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'savings' ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'}`}>Savings</button>
            </div>

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Wallet Balance */}
                            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                                <p className="text-white/70 text-sm">Wallet Balance</p>
                                <p className="text-2xl font-bold text-white">{liveData.walletBalance} ETH</p>
                            </div>
                            {/* Collateral Value */}
                             <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                                <p className="text-white/70 text-sm">Collateral Value</p>
                                <p className="text-2xl font-bold text-green-400">{parseFloat(liveData.collateralValue).toFixed(4)} ETH</p>
                            </div>
                            {/* Borrowed */}
                            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                                <p className="text-white/70 text-sm">Borrowed</p>
                                <p className="text-2xl font-bold text-orange-400">{parseFloat(liveData.borrowBalance).toFixed(4)} ETH</p>
                            </div>
                            {/* Health Factor */}
                            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                                <p className="text-white/70 text-sm">Health Factor</p>
                                <p className="text-2xl font-bold text-green-400">{parseFloat(liveData.healthFactor).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Account Tab */}
                {activeTab === 'account' && (
                    <div className="space-y-6">
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                            <h3 className="text-xl font-bold text-white mb-4">Account Management</h3>
                            {liveData.userAccountAddress === ethers.ZeroAddress || !liveData.userAccountAddress ? (
                                <div>
                                    <p className="text-white/70 mb-4">Create your smart contract account to get started.</p>
                                    <input type="text" placeholder="Choose a username" value={formData.username} onChange={(e) => handleInputChange('username', e.target.value)} className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 mb-4" />
                                    <button onClick={handleCreateAccount} className="w-full bg-blue-600 py-3 rounded-lg font-semibold">Create Account</button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-white/70 text-sm">Your Smart Account Address:</p>
                                    <p className="text-white font-mono break-all">{liveData.userAccountAddress}</p>
                                    <p className="text-2xl font-bold text-white pt-4">{liveData.accountBalance} ETH</p>
                                </div>
                            )}
                        </div>

                        {liveData.userAccountAddress !== ethers.ZeroAddress && liveData.userAccountAddress && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                                    <h3 className="text-xl font-bold text-white mb-4">Deposit / Withdraw</h3>
                                    <div className="space-y-4">
                                        <input type="number" placeholder="Deposit Amount (ETH)" value={formData.depositAmount} onChange={(e) => handleInputChange('depositAmount', e.target.value)} className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3" />
                                        <button onClick={handleAccountDeposit} className="w-full bg-green-600 py-3 rounded-lg">Deposit to Account</button>
                                        
                                        <input type="number" placeholder="Withdraw Amount (ETH)" value={formData.withdrawAmount} onChange={(e) => handleInputChange('withdrawAmount', e.target.value)} className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 mt-4" />
                                        <button onClick={handleAccountWithdraw} className="w-full bg-yellow-600 py-3 rounded-lg">Withdraw from Account</button>
                                    </div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                                    <h3 className="text-xl font-bold text-white mb-4">Transfer Funds</h3>
                                    <div className="space-y-4">
                                        <input type="text" placeholder="Recipient Address" value={formData.transferRecipient} onChange={(e) => handleInputChange('transferRecipient', e.target.value)} className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3" />
                                        <input type="number" placeholder="Amount (ETH)" value={formData.transferAmount} onChange={(e) => handleInputChange('transferAmount', e.target.value)} className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3" />
                                        <button onClick={handleTransfer} className="w-full bg-purple-600 py-3 rounded-lg">Send Transfer</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Lending Tab */}
                {activeTab === 'lending' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 space-y-4">
                             <h3 className="text-xl font-bold text-white">Deposit Collateral</h3>
                             <p className="text-sm text-white/70">Approve and deposit ERC20 tokens to use as collateral.</p>
                             <select value={formData.collateralToken} onChange={(e) => handleInputChange('collateralToken', e.target.value)} className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3">
                                <option value="0x779877A7B0D9E8603169DdbD7836e478b4624789">LINK (Sepolia)</option>
                             </select>
                             <input type="number" placeholder="Amount" value={formData.collateralAmount} onChange={(e) => handleInputChange('collateralAmount', e.target.value)} className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3" />
                             <button onClick={handleCollateralDeposit} className="w-full bg-blue-600 py-3 rounded-lg">Deposit Collateral</button>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 space-y-4">
                            <h3 className="text-xl font-bold text-white">Borrow / Repay ETH</h3>
                            <input type="number" placeholder="Borrow Amount (ETH)" value={formData.borrowAmount} onChange={(e) => handleInputChange('borrowAmount', e.target.value)} className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3" />
                            <button onClick={handleBorrow} className="w-full bg-orange-600 py-3 rounded-lg">Borrow</button>

                            <input type="number" placeholder="Repay Amount (ETH)" value={formData.repayAmount} onChange={(e) => handleInputChange('repayAmount', e.target.value)} className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 mt-4" />
                            <button onClick={handleRepay} className="w-full bg-green-600 py-3 rounded-lg">Repay</button>
                        </div>
                         <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 space-y-4 md:col-span-2">
                             <h3 className="text-xl font-bold text-white">Deposit to Pool & Mint dETH</h3>
                             <p className="text-sm text-white/70">Deposit ETH directly to the lending pool to earn yield. You will receive dETH tokens.</p>
                             <input type="number" placeholder="Amount (ETH)" value={formData.depositAmount} onChange={(e) => handleInputChange('depositAmount', e.target.value)} className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3" />
                             <button onClick={handlePoolDeposit} className="w-full bg-indigo-600 py-3 rounded-lg">Deposit to Pool</button>
                        </div>
                    </div>
                )}

                {/* Savings Tab */}
                {activeTab === 'savings' && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                         <h3 className="text-xl font-bold text-white mb-4">Account Savings</h3>
                         <p className="text-white/70 text-sm">Your savings balance (inside your smart account):</p>
                         <p className="text-3xl font-bold text-purple-400 mb-6">{liveData.savingsBalance} ETH</p>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <input type="number" placeholder="Amount to move" value={formData.savingsAmount} onChange={(e) => handleInputChange('savingsAmount', e.target.value)} className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 mb-4" />
                                <div className="flex gap-4">
                                    <button onClick={handleMoveToSavings} className="w-full bg-purple-600 py-3 rounded-lg">Move to Savings</button>
                                    <button onClick={handleWithdrawFromSavings} className="w-full bg-pink-600 py-3 rounded-lg">Withdraw from Savings</button>
                                </div>
                            </div>
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeFiDApp;