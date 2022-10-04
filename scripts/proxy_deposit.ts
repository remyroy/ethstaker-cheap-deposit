import { ethers } from "hardhat";

async function main() {
  const [faucetAccount, otherAccount] = await ethers.getSigners();
  const goerliProxyDepositContract = "0xAd24129F8ce006fb7cA08132149948AD56760A58";

  console.log(`Proxy deposit from ${otherAccount.address} using proxy on ${goerliProxyDepositContract}`);

  const DepositProxyContract = await ethers.getContractFactory("DepositProxyContract");
  const depositProxyContract = await DepositProxyContract.attach(goerliProxyDepositContract);

  await depositProxyContract.connect(otherAccount).deposit(
    Buffer.from('b2463a5172fd4bd1679b046eb13595a566c20da6d88bcd2e4fffa91c234a5b9fa103c9612f4ba40f45ed6ec01b124754', 'hex'),
    Buffer.from('005262a93dd29df6bb81bf7943dfe000e6aef8d379188ac60e84bfe40cc2c91b', 'hex'),
    Buffer.from('aec1aae821f4ac4a2b456766b75e68aab2daa6b1615a86fbd2cd3d5db10e14d8f6de6d3c1f6afea7e3ccbea9e3ae03520ef93fd867cb9513623429337ec154ca96b45f4f9fecfcf6531ab5ffa0798476cd0c7a7b8ab1cf3abc0294e5ab7c3be5', 'hex'),
    Buffer.from('ff89f4adcdd37e76acee80d24cafd59af2a2408aa159254e2519eaa4f7cb681f', 'hex'),
    {
      value: ethers.utils.parseUnits('0.0001', 'ether'),
    }
  );

  console.log(`Proxy deposit completed.`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
