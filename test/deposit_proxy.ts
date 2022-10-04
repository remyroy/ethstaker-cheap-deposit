import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("deposit_proxy", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployDepositContractAndProxy() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, thirdAccount] = await ethers.getSigners();

    const DepositContract = await ethers.getContractFactory("DepositContract");
    const depositContract = await DepositContract.deploy();

    const DepositProxyContract = await ethers.getContractFactory("DepositProxyContract");
    const depositProxyContract = await DepositProxyContract.deploy(depositContract.address);

    // Perform some deposits
    await depositContract.deposit(
      Buffer.from('8e44736cf67ec1d87497e5bedeb8d5873ea2e21ef366770ca210f4fbee3cba11b5e750dcad819141e03836cbdcd09c22', 'hex'),
      Buffer.from('000bdbdb1ee029cad792125746a73fba9d1fa6be11e842c1f7cde4fed2d32151', 'hex'),
      Buffer.from('855e35cc12358b9f22d569a3412336d2132f87e30ddf130b3fde0e7ef406ae49afbb4becf5d7f8c0e681366003ef96c70fd49884855224fbf9214dc2186c085b01ee2feb2a82429d2f31831e132882bad6ace642f3990414cb2823a164ea9b68', 'hex'),
      Buffer.from('c7be2165016b9bf3f0777b5b686aaa300e52ba068a17136da1a7025c69eb8422', 'hex'),
      {
        value: ethers.utils.parseUnits('32', 'ether'),
      }
    );

    await depositContract.deposit(
      Buffer.from('86c0ba545547456ca70c6a61f0ef946c7d7a7f6f493145338c5976ef8df2719e495c8b227263137d615fdbd9f2d61691', 'hex'),
      Buffer.from('00b252b43f4c0c61dcec6a910a6fe0bf2adfdef834db00dc45aef0f1cac92156', 'hex'),
      Buffer.from('a82e071ee0f8bd8d68c9aa29c1e364326ae2e4849585f56d2808389080d49c0b45029e580ad7b16fef165395ccfdcd670bae0a87dd245e50b98702ad10a95e89b8df03c049eb5ff7746cb7db80a12c653646610a4d1a0c4ad47215571548c1d7', 'hex'),
      Buffer.from('500c1918efbd100616b38c652020741482c9f4bf4caed9e3caf9bf9b26bae8fc', 'hex'),
      {
        value: ethers.utils.parseUnits('32', 'ether'),
      }
    );

    // Transfer 2 cheap deposit to other account
    await depositProxyContract.safeTransferFrom(owner.address, otherAccount.address, 0, 2, Buffer.from(''));

    // Send 320 ethers to depositProxyContract
    await owner.sendTransaction({
      to: depositProxyContract.address,
      value: ethers.utils.parseUnits('320.01', 'ether')
    });

    // Unfunded depositProxyContract
    const unfundedDepositProxyContract = await DepositProxyContract.deploy(depositContract.address);

    // Transfer 2 cheap deposit to other account on unfunded depositProxyContract
    await unfundedDepositProxyContract.safeTransferFrom(owner.address, otherAccount.address, 0, 2, Buffer.from(''));

    return { depositContract, depositProxyContract, unfundedDepositProxyContract, owner, otherAccount, thirdAccount };
  }

  describe("Deployment", function () {
    it("Should match deposit contract address", async function () {
      const { depositContract, depositProxyContract } = await loadFixture(deployDepositContractAndProxy);

      expect(depositContract.address).to.equal(await depositProxyContract.depositContract());
    });

    it("Should be owned by the right account", async function () {
      const { depositProxyContract, owner } = await loadFixture(deployDepositContractAndProxy);

      expect(await depositProxyContract.owner()).to.equal(owner.address);
    });

    it("Should have 2 deposits on the real contract", async function () {
      const { depositContract } = await loadFixture(deployDepositContractAndProxy);

      expect('0x0200000000000000').to.equal(await depositContract.get_deposit_count());
    });

    it("Should have 2 deposits on the proxy contract", async function () {
      const { depositProxyContract } = await loadFixture(deployDepositContractAndProxy);

      expect('0x0200000000000000').to.equal(await depositProxyContract.get_deposit_count());
    });

    it("Should have a balance of 2 for otherAccount", async function () {
      const { depositProxyContract, otherAccount } = await loadFixture(deployDepositContractAndProxy);

      expect(2).to.equal(await depositProxyContract.balanceOf(otherAccount.address, 0));
    });

    it("Should have 320.01 ethers on proxy contract", async function () {
      const { depositProxyContract } = await loadFixture(deployDepositContractAndProxy);

      expect(await depositProxyContract.provider.getBalance(depositProxyContract.address)).to.equal(ethers.utils.parseUnits('320.01', 'ether'));
    });

    it("Should have 315.01 ethers on proxy contract after withdraw", async function () {
      const { depositProxyContract, owner } = await loadFixture(deployDepositContractAndProxy);

      await depositProxyContract.withdraw(owner.address, ethers.utils.parseUnits('5', 'ether'));

      expect(await depositProxyContract.provider.getBalance(depositProxyContract.address)
        ).to.equal(ethers.utils.parseUnits('315.01', 'ether'));
    });

    it("Should fail to withdraw with other account", async function () {
      const { depositProxyContract, otherAccount } = await loadFixture(deployDepositContractAndProxy);

      expect(depositProxyContract.connect(otherAccount).withdraw(
        otherAccount.address, ethers.utils.parseUnits('5', 'ether')
        )).to.be.revertedWith('Ownable: caller is not the owner');

      expect(await depositProxyContract.provider.getBalance(depositProxyContract.address)).to.equal(ethers.utils.parseUnits('320.01', 'ether'));
    });

    it("Should have a balance of 2 for otherAccount on unfunded deposit contract", async function () {
      const { unfundedDepositProxyContract, otherAccount } = await loadFixture(deployDepositContractAndProxy);

      expect(2).to.equal(await unfundedDepositProxyContract.balanceOf(otherAccount.address, 0));
    });

    it("Should have 0 ether on unfunded proxy contract", async function () {
      const { unfundedDepositProxyContract } = await loadFixture(deployDepositContractAndProxy);

      expect(await unfundedDepositProxyContract.provider.getBalance(unfundedDepositProxyContract.address)).to.equal(ethers.utils.parseUnits('0', 'ether'));
    });
  });

  describe("Proxy deposit", function () {
    it("Should be able to do a proxy deposit with only 0.0001 ETH", async function () {
      const {depositProxyContract, otherAccount} = await loadFixture(deployDepositContractAndProxy);

      const result = await depositProxyContract.connect(otherAccount).deposit(
        Buffer.from('86c0ba545547456ca70c6a61f0ef946c7d7a7f6f493145338c5976ef8df2719e495c8b227263137d615fdbd9f2d61691', 'hex'),
        Buffer.from('00b252b43f4c0c61dcec6a910a6fe0bf2adfdef834db00dc45aef0f1cac92156', 'hex'),
        Buffer.from('a82e071ee0f8bd8d68c9aa29c1e364326ae2e4849585f56d2808389080d49c0b45029e580ad7b16fef165395ccfdcd670bae0a87dd245e50b98702ad10a95e89b8df03c049eb5ff7746cb7db80a12c653646610a4d1a0c4ad47215571548c1d7', 'hex'),
        Buffer.from('500c1918efbd100616b38c652020741482c9f4bf4caed9e3caf9bf9b26bae8fc', 'hex'),
        {
          value: ethers.utils.parseUnits('0.0001', 'ether'),
        }
      );

      expect('0x0300000000000000').to.equal(await depositProxyContract.get_deposit_count());
      expect(1).to.equal(await depositProxyContract.balanceOf(otherAccount.address, 0));
    });
  });

  describe("Proxy deposit without a cheap token", function() {
    it("Should fail to perform a proxy deposit without a cheap token", async function () {
      const {depositProxyContract, thirdAccount} = await loadFixture(deployDepositContractAndProxy);

      expect(depositProxyContract.connect(thirdAccount).deposit(
        Buffer.from('86c0ba545547456ca70c6a61f0ef946c7d7a7f6f493145338c5976ef8df2719e495c8b227263137d615fdbd9f2d61691', 'hex'),
        Buffer.from('00b252b43f4c0c61dcec6a910a6fe0bf2adfdef834db00dc45aef0f1cac92156', 'hex'),
        Buffer.from('a82e071ee0f8bd8d68c9aa29c1e364326ae2e4849585f56d2808389080d49c0b45029e580ad7b16fef165395ccfdcd670bae0a87dd245e50b98702ad10a95e89b8df03c049eb5ff7746cb7db80a12c653646610a4d1a0c4ad47215571548c1d7', 'hex'),
        Buffer.from('500c1918efbd100616b38c652020741482c9f4bf4caed9e3caf9bf9b26bae8fc', 'hex'),
        {
          value: ethers.utils.parseUnits('0.0001', 'ether'),
        }
      )).to.be.revertedWith('No cheap deposit');

    });
  });

  describe("Proxy deposit without enough value", function () {
    it("Should fail to perform a proxy deposit without enough value", async function () {
      const {depositProxyContract, otherAccount} = await loadFixture(deployDepositContractAndProxy);

      expect(depositProxyContract.connect(otherAccount).deposit(
        Buffer.from('86c0ba545547456ca70c6a61f0ef946c7d7a7f6f493145338c5976ef8df2719e495c8b227263137d615fdbd9f2d61691', 'hex'),
        Buffer.from('00b252b43f4c0c61dcec6a910a6fe0bf2adfdef834db00dc45aef0f1cac92156', 'hex'),
        Buffer.from('a82e071ee0f8bd8d68c9aa29c1e364326ae2e4849585f56d2808389080d49c0b45029e580ad7b16fef165395ccfdcd670bae0a87dd245e50b98702ad10a95e89b8df03c049eb5ff7746cb7db80a12c653646610a4d1a0c4ad47215571548c1d7', 'hex'),
        Buffer.from('500c1918efbd100616b38c652020741482c9f4bf4caed9e3caf9bf9b26bae8fc', 'hex'),
        {
          value: ethers.utils.parseUnits('0.00001', 'ether'),
        }
      )).to.be.revertedWith('DepositContract: deposit value too low');
    });
  });

  describe("Proxy deposit on unfunded contract", function () {
    it("Should fail to do a proxy deposit on unfunded contract", async function () {
      const {unfundedDepositProxyContract, otherAccount} = await loadFixture(deployDepositContractAndProxy);

      expect(unfundedDepositProxyContract.connect(otherAccount).deposit(
        Buffer.from('86c0ba545547456ca70c6a61f0ef946c7d7a7f6f493145338c5976ef8df2719e495c8b227263137d615fdbd9f2d61691', 'hex'),
        Buffer.from('00b252b43f4c0c61dcec6a910a6fe0bf2adfdef834db00dc45aef0f1cac92156', 'hex'),
        Buffer.from('a82e071ee0f8bd8d68c9aa29c1e364326ae2e4849585f56d2808389080d49c0b45029e580ad7b16fef165395ccfdcd670bae0a87dd245e50b98702ad10a95e89b8df03c049eb5ff7746cb7db80a12c653646610a4d1a0c4ad47215571548c1d7', 'hex'),
        Buffer.from('500c1918efbd100616b38c652020741482c9f4bf4caed9e3caf9bf9b26bae8fc', 'hex'),
        {
          value: ethers.utils.parseUnits('0.0001', 'ether'),
        }
      )).to.be.revertedWith('DepositContract: not enough ETH left');
    });
  });

});