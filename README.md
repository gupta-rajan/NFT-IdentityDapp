# NFT-enabled Identity and Access Management at IIT Dharwad

Welcome to our project: a decentralized blockchain-based identity and access management system for IIT Dharwad using **NFTs**. This DApp allows students and faculty to hold a unique NFT representing their identity, use it for academic course registration, fee payment, accessing amenities, and receiving verifiable course completion certificates.

---

## Project Objectives

This project demonstrates how NFTs and smart contracts can be applied to real-world institutional processes in an academic setting. Key functionalities include:

1. **Digital Identity NFTs**  
   Each student or professor mints a unique NFT containing their name, date of birth, role, and an IPFS-hosted metadata file.

2. **Academic Course Registration**  
   Users can register for courses directly through the DApp using their Identity NFT.

3. **Certificate Issuance**  
   Upon course completion, professors can issue course completion NFTs (certificates) to students. These are publicly verifiable via the blockchain.

4. **Semester Fee Payment**  
   Students can pay their semester fees through a smart contract which records every payment securely.

5. **Amenity Access Management**  
   Students and faculty can access services such as labs, events, or institute amenities using their NFTs.

---

## System Architecture Overview

- **Frontend**: React.js (`client` folder)
- **Smart Contracts**: Solidity + Hardhat (`contracts` and `scripts` folders)
- **Blockchain**: Local development via Ganache
- **Storage**: IPFS via Pinata (to store metadata for NFTs)
- **Wallet Integration**: MetaMask
- **Optional Backend**: Node.js + Express.js (`backend` folder)

---

## Installation & Setup Guide

Follow these steps to set up and run the full-stack application locally:

---

### 1. Clone the Repository
git clone repository-url

cd project-folder

--- 

### 2. Install Project Dependencies
npm install          # install root dependencies

cd client

npm install          # install frontend dependencies

cd ..

---
### 3. Start Ganache (Local Blockchain)
Start Ganache (GUI or CLI) on port 7545.

Copy the private key of the first account — it will be used for contract deployment.

---
### 4. Configure Environment Variables
Create a .env file inside client/src/ and paste your Pinata keys:

REACT_APP_PINATA_API_KEY=21767ebeecdecb816506

REACT_APP_PINATA_SECRET_API_KEY=f30c28168542a536ec5700de9869fe31b35ab0903ae63bc2b73ce2fdb637dfb0

REACT_APP_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

---
### 5. 🔧 Configure Hardhat (Private Key + Network)
Edit hardhat.config.js like this:

require("@nomicfoundation/hardhat-toolbox");

module.exports = {

  solidity: "0.8.28",

  networks: {

    ganache: {

      url: "http://127.0.0.1:7545",

      accounts: [
        "YOUR_GANACHE_PRIVATE_KEY"
      ]

    }

  }
};

---
### 6. Compile Smart Contracts
npx hardhat compile

### 7. Deploy Smart Contracts
node deployAll.js

This will deploy the following contracts:
IdentityNFT,
CourseRegistration,
CertificateNFT,
FeePayment,
AmenityAccess

It will also generate ABI files in client/src/abi and store addresses in client/src/config.js

### 8. Start Backend
app uses an Express backend:

cd client

npm install

go back to root, then 
cd backend

npm install

npm run dev 
This will run both client and backend/server.js which is used for Pinata IPFS cors.

### 9. 🦊 MetaMask Integration
Import a Ganache account into MetaMask.
Switch to the Localhost 7545 network.
Refresh the DApp to connect your wallet.

### 10. Using the DApp
Mint Identity NFT
Choose your role (Student/Professor), enter your details, and upload a photo or ID to IPFS.

Register for Courses
As a student, use your Identity NFT to register for offered courses.

Issue Certificates
As a professor, select registered students and issue course completion NFTs.

Pay Semester Fees
Students can pay fees securely through the DApp.

Access Amenities
Use the access control module to verify eligibility for amenities and events.