import { ethers } from "hardhat";

async function main() {
  const [faucetAccount] = await ethers.getSigners();
  const goerliProxyDepositContract = "0xAd24129F8ce006fb7cA08132149948AD56760A58";
  const tokenRecipient = "0xbefa3427a18216deC3EFE1f41E7d1B30F2a51E10";

  console.log(`Sending tokens from ${faucetAccount.address} using proxy on ${goerliProxyDepositContract}`);

  const DepositProxyContract = await ethers.getContractFactory("DepositProxyContract");
  const depositProxyContract = await DepositProxyContract.attach(goerliProxyDepositContract);

  await depositProxyContract.safeTransferFrom(faucetAccount.address, tokenRecipient, 0, 2, Buffer.from(''));

  console.log(`2 tokens sent to ${tokenRecipient}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
