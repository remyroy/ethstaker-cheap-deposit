import { ethers } from "hardhat";

async function main() {
  const [faucetAccount] = await ethers.getSigners();
  const holeskyDepositContract = "0x4242424242424242424242424242424242424242";

  console.log(`Deploying from ${faucetAccount.address}`);

  const DepositProxyContract = await ethers.getContractFactory("DepositProxyContract");
  const depositProxyContract = await DepositProxyContract.deploy(holeskyDepositContract);

  console.log(`DepositProxyContract deployed to ${depositProxyContract.address} ` +
    `with transaction ${depositProxyContract.deployTransaction.hash}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
