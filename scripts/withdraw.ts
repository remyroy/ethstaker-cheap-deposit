import dotenv from "dotenv"
dotenv.config();

import { ethers } from "hardhat";

const { PROXY_CONTRACT } = process.env;

async function main() {
  const [faucetAccount] = await ethers.getSigners();
  const goerliProxyDepositContract = PROXY_CONTRACT as string;
  const amount = ethers.utils.parseUnits('255', 'ether');

  console.log(`Withdrawing to ${faucetAccount.address}`);

  const DepositProxyContract = await ethers.getContractFactory("DepositProxyContract");
  const depositProxyContract = await DepositProxyContract.attach(goerliProxyDepositContract);

  const withdrawTransaction = await depositProxyContract.withdraw(
    faucetAccount.address, amount);

  console.log(`${amount} sent to ${faucetAccount.address} with transaction ${withdrawTransaction.hash}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});