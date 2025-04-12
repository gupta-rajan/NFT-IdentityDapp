const hre = require("hardhat");
const { saveAddress } = require("./utils/saveAddress");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying IdentityNFT with:", deployer.address);

    const IdentityNFT = await hre.ethers.getContractFactory("IdentityNFT");
    const identityNFT = await IdentityNFT.deploy();
    await identityNFT.waitForDeployment();

    const address = await identityNFT.getAddress();
    console.log("IdentityNFT deployed to:", address);
    saveAddress("IdentityNFT", address);
}

main().catch(console.error);

// Deploying IdentityNFT with: 0x245D1d9Dc6854F44120634b0De62EB5B0C0E610d
// IdentityNFT deployed to: 0x46396660aB19d463c2a80Cef7E9604ca9903d231