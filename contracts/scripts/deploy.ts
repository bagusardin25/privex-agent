import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying PortfolioActionAgent to Flare Testnet (Coston2)...\n");

  const connection = await hre.network.connect("coston2");
  const [deployer] = await connection.ethers.getSigners();
  const balance = await connection.ethers.provider.getBalance(deployer.address);

  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", connection.ethers.formatEther(balance), "C2FLR");
  console.log("");

  if (balance === 0n) {
    console.error("❌ Deployer has no C2FLR. Get testnet tokens from:");
    console.error("   https://faucet.flare.network/coston2");
    process.exit(1);
  }

  // Deploy the contract
  console.log("Deploying PortfolioActionAgent...");
  const PortfolioActionAgent = await connection.ethers.getContractFactory("PortfolioActionAgent");
  const contract = await PortfolioActionAgent.deploy();

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  const deployTx = contract.deploymentTransaction();

  console.log("\n✅ PortfolioActionAgent deployed successfully!\n");
  console.log("  Contract Address:", contractAddress);
  console.log("  Transaction Hash:", deployTx?.hash);
  console.log("  Network:          Flare Testnet (Coston2)");
  console.log("  Chain ID:         114");
  console.log("  Explorer:         https://coston2-explorer.flare.network/address/" + contractAddress);
  console.log("");

  // Verify supported assets
  console.log("Verifying supported assets...");
  const assets = await contract.getSupportedAssets();
  console.log("  Supported assets:", assets.join(", "));

  console.log("\n📋 Next steps:");
  console.log(`  1. Add to .env.local: NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("  2. Restart the Next.js dev server");
  console.log("  3. The execute endpoint will now interact with this contract\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
