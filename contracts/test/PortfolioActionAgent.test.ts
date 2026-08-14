import { expect } from "chai";
import { anyUint } from "@nomicfoundation/hardhat-ethers-chai-matchers/withArgs";
import { network } from "hardhat";

describe("PortfolioActionAgent", function () {
  // Hardhat 3 exposes `ethers` on a network connection, not on the `hardhat`
  // module. Each `create()` call spins up a fresh in-memory chain, so every
  // fixture starts from a clean state.
  async function deployFixture() {
    const { ethers } = await network.create();
    const [owner, user1, user2] = await ethers.getSigners();
    const PortfolioActionAgent = await ethers.getContractFactory("PortfolioActionAgent");
    const contract = await PortfolioActionAgent.deploy();
    await contract.waitForDeployment();
    return { ethers, contract, owner, user1, user2 };
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
      const { ethers, contract, user1 } = await deployFixture();

      const recHash = ethers.keccak256(ethers.toUtf8Bytes("rec-123"));
      await expect(contract.connect(user1).recordAction(0, "XRP", 4000, recHash))
        .to.emit(contract, "ActionRecorded")
        .withArgs(0, user1.address, 0, "XRP", 4000, anyUint, recHash);

      expect(await contract.nextActionId()).to.equal(1);
    });

    it("should store action data correctly", async function () {
      const { ethers, contract, user1 } = await deployFixture();

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
      const { ethers, contract, user1 } = await deployFixture();
      const recHash = ethers.keccak256(ethers.toUtf8Bytes("rec-789"));

      await expect(
        contract.connect(user1).recordAction(0, "DOGE", 5000, recHash)
      ).to.be.revertedWithCustomError(contract, "UnsupportedAsset");
    });

    it("should reject exposure above 100%", async function () {
      const { ethers, contract, user1 } = await deployFixture();
      const recHash = ethers.keccak256(ethers.toUtf8Bytes("rec-abc"));

      await expect(
        contract.connect(user1).recordAction(0, "XRP", 10001, recHash)
      ).to.be.revertedWithCustomError(contract, "InvalidExposure");
    });

    it("should track user action IDs", async function () {
      const { ethers, contract, user1, user2 } = await deployFixture();
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

      expect(await contract.getUserActionCount(user1.address)).to.equal(2);
      expect(await contract.getUserActionCount(user2.address)).to.equal(1);
    });
  });

  describe("cancelAction", function () {
    it("should reject cancelling an action that does not exist", async function () {
      const { contract, user1 } = await deployFixture();

      await expect(
        contract.connect(user1).cancelAction(99)
      ).to.be.revertedWithCustomError(contract, "ActionNotFound");
    });

    it("should reject a non-owner cancelling someone else's action", async function () {
      const { ethers, contract, user1, user2 } = await deployFixture();
      const recHash = ethers.keccak256(ethers.toUtf8Bytes("rec-owner"));

      await contract.connect(user1).recordAction(0, "XRP", 4000, recHash);

      await expect(
        contract.connect(user2).cancelAction(0)
      ).to.be.revertedWithCustomError(contract, "NotActionOwner");
    });

    it("should reject cancelling an already-finalized action", async function () {
      const { ethers, contract, user1 } = await deployFixture();
      const recHash = ethers.keccak256(ethers.toUtf8Bytes("rec-final"));

      // recordAction stores actions as EXECUTED, so there is currently no
      // reachable PENDING state and every cancel attempt is rejected here.
      await contract.connect(user1).recordAction(0, "XRP", 4000, recHash);

      await expect(
        contract.connect(user1).cancelAction(0)
      ).to.be.revertedWithCustomError(contract, "ActionAlreadyFinalized");
    });
  });

  describe("View functions", function () {
    it("should report asset support through isAssetSupported", async function () {
      const { contract } = await deployFixture();

      expect(await contract.isAssetSupported("XRP")).to.equal(true);
      expect(await contract.isAssetSupported("DOGE")).to.equal(false);
    });

    it("should revert getAction for an unrecorded id", async function () {
      const { contract } = await deployFixture();

      await expect(contract.getAction(0)).to.be.revertedWithCustomError(
        contract,
        "ActionNotFound"
      );
    });
  });

  describe("Edge cases", function () {
    it("should allow 0% exposure (HOLD equivalent)", async function () {
      const { ethers, contract, user1 } = await deployFixture();
      const recHash = ethers.keccak256(ethers.toUtf8Bytes("rec-zero"));

      await expect(
        contract.connect(user1).recordAction(3, "XRP", 0, recHash)
      ).to.not.revert(ethers);
    });

    it("should allow 100% exposure", async function () {
      const { ethers, contract, user1 } = await deployFixture();
      const recHash = ethers.keccak256(ethers.toUtf8Bytes("rec-max"));

      await expect(
        contract.connect(user1).recordAction(0, "XRP", 10000, recHash)
      ).to.not.revert(ethers);
    });

    it("should reject more than MAX_ACTIONS_PER_USER actions", async function () {
      const { ethers, contract, user1 } = await deployFixture();
      const recHash = ethers.keccak256(ethers.toUtf8Bytes("rec-limit"));

      const max = Number(await contract.MAX_ACTIONS_PER_USER());
      for (let i = 0; i < max; i++) {
        await contract.connect(user1).recordAction(0, "XRP", 1000, recHash);
      }

      await expect(
        contract.connect(user1).recordAction(0, "XRP", 1000, recHash)
      ).to.be.revertedWithCustomError(contract, "TooManyActions");
    });
  });
});
