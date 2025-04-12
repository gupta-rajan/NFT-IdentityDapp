const hre = require("hardhat");
const { saveAddress, getAddress } = require("./utils/saveAddress");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const identityNFTAddress = getAddress("IdentityNFT");

    const FeePayment = await hre.ethers.getContractFactory("FeePayment");
    const feePayment = await FeePayment.deploy(identityNFTAddress, hre.ethers.parseEther("0.01"));
    await feePayment.waitForDeployment();

    const address = await feePayment.getAddress();
    console.log("FeePayment deployed to:", address);
    saveAddress("FeePayment", address);
}

main().catch(console.error);

// FeePayment deployed to: 0x8a2D106Fa10AD926e348dB526fCc91C318202696