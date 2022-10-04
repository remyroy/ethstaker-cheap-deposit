import dotenv from "dotenv"
dotenv.config();

import { ethers } from "hardhat";

const { PROXY_CONTRACT } = process.env;

async function main() {
  const [faucetAccount, otherAccount] = await ethers.getSigners();
  const goerliProxyDepositContract = PROXY_CONTRACT as string;
  const otherAddress = otherAccount.address;
  const tokenAmount = 4;

  console.log(`Sending tokens from ${faucetAccount.address} using proxy on ${goerliProxyDepositContract}`);

  const DepositProxyContract = await ethers.getContractFactory("DepositProxyContract");
  const depositProxyContract = await DepositProxyContract.attach(goerliProxyDepositContract);

  const transferTransaction = await depositProxyContract.safeTransferFrom(
    faucetAccount.address, otherAddress, 0, tokenAmount, Buffer.from(''));
  
  console.log(`${tokenAmount} tokens sent to ${otherAddress} with transaction ${transferTransaction.hash}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
