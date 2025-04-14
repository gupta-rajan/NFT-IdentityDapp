require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      accounts: [
        "0x11ffdb7fdfa332ff5cc9ac6e4b9d68e083cd95e92ff7c0a33227184ca2a00004" 
      ]
    }
  }
};