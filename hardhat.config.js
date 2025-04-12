require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      accounts: [
        "0x9ce8fd421d2efc0c2f358b3199b4d6e39f28f042a1e927d083e84560be9bfd53" 
      ]
    }
  }
};