const fs = require("fs");
const path = require("path");

// Path to the saved addresses JSON file
const addressesFilePath = path.resolve(__dirname, "../addresses.json");

const saveAddress = (contractName, address) => {
    let addresses = {};
    // Read existing addresses if any
    if (fs.existsSync(addressesFilePath)) {
        addresses = JSON.parse(fs.readFileSync(addressesFilePath, "utf8"));
    }

    // Save the new address for the contract
    addresses[contractName] = address;
    fs.writeFileSync(addressesFilePath, JSON.stringify(addresses, null, 2), "utf8");
    console.log(`Address for ${contractName} saved to ${addressesFilePath}`);
};

const getAddress = (contractName) => {
    if (fs.existsSync(addressesFilePath)) {
        const addresses = JSON.parse(fs.readFileSync(addressesFilePath, "utf8"));
        return addresses[contractName];
    }
    return null;
};

module.exports = { saveAddress, getAddress };