import { ethers } from "hardhat";

async function main() {
  const [faucetAccount] = await ethers.getSigners();
  const goerliProxyDepositContract = "0xC72FD00185D326F30606140b6f6E5A8b12e1CAf0";
  const tokenRecipient = "0xbefa3427a18216deC3EFE1f41E7d1B30F2a51E10";

  console.log(`Sending tokens from ${faucetAccount.address} using proxy on ${goerliProxyDepositContract}`);

  const DepositProxyContract = await ethers.getContractFactory("DepositProxyContract");
  const depositProxyContract = await DepositProxyContract.attach(goerliProxyDepositContract);

  await depositProxyContract.safeTransferFrom(faucetAccount.address, tokenRecipient, 0, 4, Buffer.from(''));

  console.log(`4 tokens sent to ${tokenRecipient}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
