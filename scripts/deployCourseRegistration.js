const hre = require("hardhat");
const { saveAddress, getAddress } = require("./utils/saveAddress");

async function main() {
    const identityNFTAddress = getAddress("IdentityNFT");
    const feePaymentAddress = getAddress("FeePayment");

    const CourseRegistration = await hre.ethers.getContractFactory("CourseRegistration");
    const courseReg = await CourseRegistration.deploy(identityNFTAddress, feePaymentAddress);
    await courseReg.waitForDeployment();

    const address = await courseReg.getAddress();
    console.log("CourseRegistration deployed to:", address);
    saveAddress("CourseRegistration", address);
}

main().catch(console.error);

// CourseRegistration deployed to: 0xFca79e33296e67D9C8B9Ffde4E4d078685d679F0