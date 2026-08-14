import { expect } from "chai";
import { ethers } from "hardhat";
import { PortfolioActionAgent } from "../artifacts/contracts/PortfolioActionAgent.sol/PortfolioActionAgent";

describe("PortfolioActionAgent", function () {
  async function deployFixture() {
    const [owner, user1, user2] = await ethers.getSigners();
    const PortfolioActionAgent = await ethers.getContractFactory("PortfolioActionAgent");
    const contract = await PortfolioActionAgent.deploy();
    return { contract, owner, user1, user2 };
  }

  describe("Deployment", function () {
    it("should initialize with supported assets", async function () {
      const { contract } = await deployFixture();
      const assets = await contract.getSupportedAssets();
      expect(assets).to.include("XRP");
      expect(assets).to.include("FXRP");
      expect(assets).to.include("FLR");
      expect(assets).to.include("WFLR");
      expect(assets).to.include("C2FLR");
      expect(assets).to.include("USDC");
      expect(assets).to.include("USDT");
    });

    it("should start with nextActionId = 0", async function () {
      const { contract } = await deployFixture();
      expect(await contract.nextActionId()).to.equal(0);
    });
  });

  describe("recordAction", function () {
    it("should record a valid REBALANCE action", async function () {
      const { contract, user1 } = await deployFixture();

      const recHash = ethers.keccak256(ethers.toUtf8Bytes("rec-123"));
      await expect(contract.connect(user1).recordAction(0, "XRP", 4000, recHash))
        .to.emit(contract, "ActionRecorded")
        .withArgs(0, user1.address, 0, "XRP", 4000, (v: bigint) => v > 0n, recHash);

      expect(await contract.nextActionId()).to.equal(1);
    });

    it("should store action data correctly", async function () {
      const { contract, user1 } = await deployFixture();

      const recHash = ethers.keccak256(ethers.toUtf8Bytes("rec-456"));
      await contract.connect(user1).recordAction(1, "FXRP", 3000, recHash);

      const action = await contract.getAction(0);
      expect(action.user).to.equal(user1.address);
      expect(action.actionType).to.equal(1); // REDUCE_EXPOSURE
      expect(action.asset).to.equal("FXRP");
      expect(action.targetExposureBps).to.equal(3000);
      expect(action.status).to.equal(1); // EXECUTED
      expect(action.recommendationHash).to.equal(recHash);
    });

    it("should reject unsupported assets", async function () {
      const { contract, user1 } = await deployFixture();
      const recHash = ethers.keccak256(ethers.toUtf8Bytes("rec-789"));

      await expect(
        contract.connect(user1).recordAction(0, "DOGE", 5000, recHash)
      ).to.be.revertedWithCustomError(contract, "UnsupportedAsset");
    });

    it("should reject exposure above 100%", async function () {
      const { contract, user1 } = await deployFixture();
      const recHash = ethers.keccak256(ethers.toUtf8Bytes("rec-abc"));

      await expect(
        contract.connect(user1).recordAction(0, "XRP", 10001, recHash)
      ).to.be.revertedWithCustomError(contract, "InvalidExposure");
    });

    it("should track user action IDs", async function () {
      const { contract, user1, user2 } = await deployFixture();
      const recHash = ethers.keccak256(ethers.toUtf8Bytes("rec-def"));

      await contract.connect(user1).recordAction(0, "XRP", 4000, recHash);
      await contract.connect(user1).recordAction(1, "FXRP", 2000, recHash);
      await contract.connect(user2).recordAction(0, "FLR", 5000, recHash);

      const user1Actions = await contract.getUserActionIds(user1.address);
      const user2Actions = await contract.getUserActionIds(user2.address);

      expect(user1Actions.length).to.equal(2);
      expect(user2Actions.length).to.equal(1);
      expect(user1Actions[0]).to.equal(0);
      expect(user1Actions[1]).to.equal(1);
      expect(user2Actions[0]).to.equal(2);
    });
  });

  describe("Edge cases", function () {
    it("should allow 0% exposure (HOLD equivalent)", async function () {
      const { contract, user1 } = await deployFixture();
      const recHash = ethers.keccak256(ethers.toUtf8Bytes("rec-zero"));

      await expect(contract.connect(user1).recordAction(3, "XRP", 0, recHash))
        .to.not.be.reverted;
    });

    it("should allow 100% exposure", async function () {
      const { contract, user1 } = await deployFixture();
      const recHash = ethers.keccak256(ethers.toUtf8Bytes("rec-max"));

      await expect(contract.connect(user1).recordAction(0, "XRP", 10000, recHash))
        .to.not.be.reverted;
    });
  });
});
