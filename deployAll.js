const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const contracts = [
  { name: "IdentityNFT", script: "scripts/deployIdentityNFT.js" },
  { name: "FeePayment", script: "scripts/deployFeePayment.js" },
  { name: "CertificateNFT", script: "scripts/deployCertificateNFT.js" },
  { name: "CourseRegistration", script: "scripts/deployCourseRegistration.js" },
  { name: "AmenityAccess", script: "scripts/deployAmenityAccess.js" }
];

// Paths
const abiFolderPath = path.resolve(__dirname, "client/src/abi");
const addressesPath = path.resolve(__dirname, "client/src/addresses.json");
const configPath = path.resolve(__dirname, "client/src/config.js");

let deployedAddresses = {};

// Ensure ABI folder exists
if (!fs.existsSync(abiFolderPath)) {
  fs.mkdirSync(abiFolderPath, { recursive: true });
}

// Deploy contracts and copy ABIs
async function deployContracts() {
  for (const contract of contracts) {
    try {
      console.log(`\n Running ${contract.script}`);
      const output = execSync(`npx hardhat run ${path.resolve(contract.script)} --network ganache`).toString();

      const regex = /deployed to:\s(0x[a-fA-F0-9]{40})/;
      const match = output.match(regex);
      if (!match) throw new Error(`No deployed address found for ${contract.name}`);

      const address = match[1];
      deployedAddresses[contract.name] = address;
      console.log(`${contract.name} deployed to: ${address}`);

      const artifactPath = path.resolve(__dirname, "artifacts/contracts", `${contract.name}.sol`);
      const abiFiles = fs.readdirSync(artifactPath).filter(f => f.endsWith(".json") && !f.endsWith(".dbg.json"));

      abiFiles.forEach(file => {
        fs.copyFileSync(path.join(artifactPath, file), path.join(abiFolderPath, file));
        console.log(`Copied ABI: ${file}`);
      });

    } catch (err) {
      console.error(`Error with ${contract.name}:`, err.message);
      process.exit(1);
    }
  }

  fs.writeFileSync(addressesPath, JSON.stringify(deployedAddresses, null, 2));
  console.log("Saved contract addresses to client/src/addresses.json");

  generateConfig();
}

// Generate client/src/config.js from addresses.json
function generateConfig() {
  let config = "";
  Object.keys(deployedAddresses).forEach(contractName => {
    config += `import ${contractName} from "./abi/${contractName}.json";\n`;
  });
  config += "\n";
  Object.entries(deployedAddresses).forEach(([contractName, address]) => {
    config += `export const ${contractName.toUpperCase()}_ADDRESS = "${address}";\n`;
    config += `export const ${contractName.toUpperCase()}_ABI = ${contractName}.abi;\n\n`;
  });

  fs.writeFileSync(configPath, config);
  console.log("Generated client/src/config.js");
}

// Run
deployContracts();