import { ethers } from "hardhat";

async function main() {
  const [faucetAccount] = await ethers.getSigners();
  const hoodiDepositContract = "0x00000000219ab540356cBB839Cbe05303d7705Fa";

  console.log(`Deploying from ${faucetAccount.address}`);

  const DepositProxyContract = await ethers.getContractFactory("DepositProxyContract");
  const depositProxyContract = await DepositProxyContract.deploy(hoodiDepositContract);

  console.log(`DepositProxyContract deployed to ${depositProxyContract.address} ` +
    `with transaction ${depositProxyContract.deployTransaction.hash}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
