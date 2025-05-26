require("@nomiclabs/hardhat-ethers")
require('hardhat-deploy');
require('dotenv').config();

const GEO_RPC = process.env.RPC_GEO;
const GEO_PK = process.env.PK_GEO;
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  defaultNetwork: "hardhat",
  networks:{
    Goerli:{
      url:GEO_RPC,
      accounts:[GEO_PK],
      chainId:5,
    },
  }
};
