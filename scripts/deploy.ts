import { ethers } from "hardhat";

async function main() {
  const [faucetAccount] = await ethers.getSigners();
  const goerliDepositContract = "0xff50ed3d0ec03aC01D4C79aAd74928BFF48a7b2b";

  console.log(`Deploying from ${faucetAccount.address}`);

  const DepositProxyContract = await ethers.getContractFactory("DepositProxyContract");
  const depositProxyContract = await DepositProxyContract.deploy(goerliDepositContract);

  console.log(`DepositProxyContract deployed to ${depositProxyContract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
