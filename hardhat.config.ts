import { existsSync } from "node:fs";
import { defineConfig } from "hardhat/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";

// Hardhat 3 does not read .env files on its own (unlike Next.js), so load the
// same .env.local the app uses. Real env vars still win.
if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

const rawKey = (process.env.DEPLOYER_PRIVATE_KEY || "").trim();
const DEPLOYER_PRIVATE_KEY = rawKey === "" ? "" : rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;

export default defineConfig({
  plugins: [hardhatToolboxMochaEthers],

  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    // Flare Testnet (Coston2)
    coston2: {
      type: "http",
      url: "https://coston2-api.flare.network/ext/C/rpc",
      chainId: 114,
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
    },
    // Flare Mainnet (for future use)
    flare: {
      type: "http",
      url: "https://flare-api.flare.network/ext/C/rpc",
      chainId: 14,
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
    },
  },

  paths: {
    sources: "./contracts",
    tests: "./contracts/test",
    cache: "./contracts/cache",
    artifacts: "./contracts/artifacts",
  },
});
