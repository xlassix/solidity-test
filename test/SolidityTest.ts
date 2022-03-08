import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();
const { expect } = chai;

describe("SolidityTest", function () {
  let owner: SignerWithAddress, minter: SignerWithAddress;
  let base: Contract; // contracts

  beforeEach(async function () {
    [owner, minter] = await ethers.getSigners();
    const SoldityTest = await ethers.getContractFactory("SolidityTest");
    base = await SoldityTest.deploy();
  });

  it("Should mint 5 successfully", async function () {
    const mintFee: BigNumber = await base.PRICE();
    await base.connect(minter).mint(5, { value: mintFee.mul(5) });
    for (let i = 1; i <= 5; i++) {
      expect(await base.ownerOf(i)).to.be.equal(minter.address);
    }
  });

  it("Should fail to mint more than 5", async function () {
    const mintFee: BigNumber = await base.PRICE();
    const tx = base.connect(minter).mint(6, { value: mintFee.mul(6) });
    expect(tx).eventually.to.be.rejectedWith("fail");
  });

  it("Should fail to mint 0", async function () {
    const tx = base.connect(minter).mint(0);
    expect(tx).eventually.to.be.rejectedWith("");
  });

  it("Should fail to mint insufficient fund", async function () {
    const tx = base.connect(minter).mint(1);
    expect(tx).eventually.to.be.rejectedWith("insufficient fund");
  });

  it("Should mint all successfully", async function () {
    const mintFee = await base.PRICE();
    for (let i = 0; i < 200; i++) {
      await base.connect(minter).mint(5, { value: mintFee.mul(5) });
    }
    for (let i = 1; i <= 1000; i++) {
      expect(await base.ownerOf(i), i).to.be.equal(minter.address);
    }
  });

  it("Should fail to mint more than max", async function () {
    const mintFee: BigNumber = await base.PRICE();
    for (let i = 0; i < 200; i++) {
      await base.connect(minter).mint(5, { value: mintFee.mul(5) });
    }
    const tx = base.connect(minter).mint(1, { value: mintFee });
    expect(tx).eventually.to.be.rejectedWith("");
  });

  it("Should successfully claim ethers", async function () {
    const mintFee: BigNumber = await base.PRICE();
    await base.connect(minter).mint(5, { value: mintFee.mul(5) });
    await base.connect(owner).claim();
    expect(await owner.getBalance()).to.be.gte(
      BigNumber.from("10000495700000000000000")
    );
  });

  it("Non owner should not be able to claim ethers", async function () {
    const mintFee: BigNumber = await base.PRICE();
    await base.connect(minter).mint(5, { value: mintFee.mul(5) });
    const tx = base.connect(minter).claim();
    expect(tx).eventually.to.be.rejectedWith("");
  });
});
