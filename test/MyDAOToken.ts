import { expect } from "chai";
import { ethers } from "hardhat";
import { MyDAOToken } from "../typechain-types";

describe("MyDAOToken", function () {
  let token: MyDAOToken;
  let owner: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const MyDAOToken = await ethers.getContractFactory("MyDAOToken");
    token = await MyDAOToken.deploy();
    await token.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });

    it("Should have correct token information", async function () {
      expect(await token.name()).to.equal("MyDAO Token");
      expect(await token.symbol()).to.equal("MDAO");
      expect(await token.decimals()).to.equal(18);
    });

    it("Should mint initial supply to owner", async function () {
      const initialSupply = ethers.parseEther("1000000");
      expect(await token.totalSupply()).to.equal(initialSupply);
      expect(await token.balanceOf(owner.address)).to.equal(initialSupply);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      const initialBalance = await token.balanceOf(user1.address);
      
      await expect(token.mint(user1.address, mintAmount))
        .to.emit(token, "TokensMinted")
        .withArgs(user1.address, mintAmount);
      
      expect(await token.balanceOf(user1.address)).to.equal(initialBalance + mintAmount);
    });

    it("Should not allow non-owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      
      await expect(token.connect(user1).mint(user2.address, mintAmount))
        .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("Should not allow minting to zero address", async function () {
      const mintAmount = ethers.parseEther("1000");
      
      await expect(token.mint(ethers.ZeroAddress, mintAmount))
        .to.be.revertedWith("Cannot mint to zero address");
    });

    it("Should not allow minting zero amount", async function () {
      await expect(token.mint(user1.address, 0))
        .to.be.revertedWith("Amount must be greater than 0");
    });
  });

  describe("ERC20 functionality", function () {
    it("Should allow token transfers", async function () {
      const transferAmount = ethers.parseEther("100");
      await token.transfer(user1.address, transferAmount);
      
      expect(await token.balanceOf(user1.address)).to.equal(transferAmount);
    });

    it("Should allow approved spending", async function () {
      const approveAmount = ethers.parseEther("500");
      await token.approve(user1.address, approveAmount);
      
      expect(await token.allowance(owner.address, user1.address)).to.equal(approveAmount);
      
      await token.connect(user1).transferFrom(owner.address, user2.address, approveAmount);
      expect(await token.balanceOf(user2.address)).to.equal(approveAmount);
    });
  });

  describe("Token Information", function () {
    it("Should return correct token information via getTokenInfo", async function () {
      const [tokenName, tokenSymbol, tokenDecimals, tokenTotalSupply, tokenOwner] = 
        await token.getTokenInfo();
      
      expect(tokenName).to.equal("MyDAO Token");
      expect(tokenSymbol).to.equal("MDAO");
      expect(tokenDecimals).to.equal(18);
      expect(tokenTotalSupply).to.equal(ethers.parseEther("1000000"));
      expect(tokenOwner).to.equal(owner.address);
    });

    it("Should have correct initial supply constant", async function () {
      const initialSupply = await token.INITIAL_SUPPLY();
      expect(initialSupply).to.equal(ethers.parseEther("1000000"));
    });
  });
}); 