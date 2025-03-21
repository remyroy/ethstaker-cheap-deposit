import dotenv from "dotenv"
dotenv.config();

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
const { HOLESKY_API_URL, HOODI_API_URL, PRIVATE_KEY, OTHER_PRIVATE_KEY } = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    hardhat: {},
    holesky: {
      url: HOLESKY_API_URL,
      accounts: [`0x${PRIVATE_KEY}`, `0x${OTHER_PRIVATE_KEY}`]
    },
    hoodi: {
      url: HOODI_API_URL,
      accounts: [`0x${PRIVATE_KEY}`, `0x${OTHER_PRIVATE_KEY}`]
    },
  },
};

export default config;
