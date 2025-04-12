const hre = require("hardhat");
const { saveAddress } = require("./utils/saveAddress");

async function main() {
    const CertificateNFT = await hre.ethers.getContractFactory("CertificateNFT");
    const cert = await CertificateNFT.deploy();
    await cert.waitForDeployment();

    const address = await cert.getAddress();
    console.log("CertificateNFT deployed to:", address);
    saveAddress("CertificateNFT", address);
}

main().catch(console.error);

// CertificateNFT deployed to: 0x9B96BC251fB37e5e699D3216401732dFAc42b582