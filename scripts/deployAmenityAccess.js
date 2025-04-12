const hre = require("hardhat");
const { saveAddress, getAddress } = require("./utils/saveAddress");

async function main() {
    // Get the deployed address of the IdentityNFT contract from saved addresses
    const identityNFTAddress = getAddress("IdentityNFT");

    // Get the contract factory for AmenitiesUtilization (formerly AmenityAccess)
    const AmenitiesUtilization = await hre.ethers.getContractFactory("AmenityAccess");

    // Deploy the AmenitiesUtilization contract with the IdentityNFT address
    const utilization = await AmenitiesUtilization.deploy(identityNFTAddress);
    await utilization.waitForDeployment();

    // Get the deployed contract address
    const address = await utilization.getAddress();
    console.log("AmenityAccess deployed to:", address);

    // Save the deployed contract address for future use
    saveAddress("AmenityAccess", address);
}

main().catch(console.error);