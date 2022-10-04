import { ethers } from "hardhat";

async function main() {
  const [faucetAccount, otherAccount] = await ethers.getSigners();
  const goerliProxyDepositContract = "0xF1F6a5c2c86F57909Cbe6064FBC8a6BB56B03143";
  const tokenAmount = 4;

  console.log(`Sending tokens from ${faucetAccount.address} using proxy on ${goerliProxyDepositContract}`);

  const DepositProxyContract = await ethers.getContractFactory("DepositProxyContract");
  const depositProxyContract = await DepositProxyContract.attach(goerliProxyDepositContract);

  const transferTransaction = await depositProxyContract.safeTransferFrom(
    faucetAccount.address, otherAccount.address, 0, tokenAmount, Buffer.from(''));
  
  console.log(`${tokenAmount} tokens sent to ${otherAccount.address} with transaction ${transferTransaction.hash}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
