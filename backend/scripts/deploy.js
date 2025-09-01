const hre = require("hardhat");
const fs = require('fs');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log("Starting full deployment and configuration...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Addresses for Sepolia Testnet
  const CHAINLINK_FEEDS = {
    ETH_USD: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    BTC_USD: "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43",
    USDC_USD: "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E",
    LINK_USD: "0x48731cf7e82dc9fbd624608615be9a3beb214152", // Added LINK price feed
  };

  const TOKENS = {
    USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    WBTC: "0x29f2D40B0605204364af54EC677bD022dA425d03",
    LINK: "0x779877A7B0D9E8603169DdbD7836e478b4624789", // Added LINK token
  };

  const deployedContracts = {};

  try {
    // Deploy DETH
    console.log("\n1. Deploying DETH token...");
    const DETH = await hre.ethers.getContractFactory("DETH");
    const deth = await DETH.deploy();
    await deth.waitForDeployment();
    const dethAddress = await deth.getAddress();
    deployedContracts.DETH = dethAddress;
    console.log("✅ DETH token deployed to:", dethAddress);
    await delay(15000);

    // Deploy Lending
    console.log("\n2. Deploying Lending contract...");
    const Lending = await hre.ethers.getContractFactory("Lending");
    const lending = await Lending.deploy(dethAddress, CHAINLINK_FEEDS.ETH_USD);
    await lending.waitForDeployment();
    const lendingAddress = await lending.getAddress();
    deployedContracts.Lending = lendingAddress;
    console.log("✅ Lending contract deployed to:", lendingAddress);
    await delay(15000);

    // Set Minter
    console.log("\n3. Setting DETH minter...");
    const setMinterTx = await deth.setMinter(lendingAddress);
    await setMinterTx.wait();
    console.log("✅ DETH minter set.");
    await delay(15000);

    // Deploy AccountFactory
    console.log("\n4. Deploying AccountFactory...");
    const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");
    const accountFactory = await AccountFactory.deploy();
    await accountFactory.waitForDeployment();
    const factoryAddress = await accountFactory.getAddress();
    deployedContracts.AccountFactory = factoryAddress;
    console.log("✅ AccountFactory deployed to:", factoryAddress);
    await delay(15000);

    // --- CONFIGURATION ---
    console.log("\n5. Configuring supported collateral...");

    // Add LINK
    console.log("   - Adding LINK...");
    const linkTx = await lending.setSupportedCollateral(TOKENS.LINK, true, CHAINLINK_FEEDS.LINK_USD);
    await linkTx.wait();
    console.log("   ✅ LINK configured.");
    await delay(15000);
    
    // Add USDC
    console.log("   - Adding USDC...");
    const usdcTx = await lending.setSupportedCollateral(TOKENS.USDC, true, CHAINLINK_FEEDS.USDC_USD);
    await usdcTx.wait();
    console.log("   ✅ USDC configured.");
    await delay(15000);

    // Add WBTC
    console.log("   - Adding WBTC...");
    const wbtcTx = await lending.setSupportedCollateral(TOKENS.WBTC, true, CHAINLINK_FEEDS.BTC_USD);
    await wbtcTx.wait();
    console.log("   ✅ WBTC configured.");

    console.log("\n🎉 Deployment and configuration complete!");
    
    // --- SUMMARY ---
    console.log("\n📋 DEPLOYMENT SUMMARY:");
    console.log("========================");
    console.log(`DETH: "${dethAddress}"`);
    console.log(`Lending: "${lendingAddress}"`);
    console.log(`AccountFactory: "${factoryAddress}"`);

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});