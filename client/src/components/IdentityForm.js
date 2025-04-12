import React, { useState } from "react";
import { ethers } from "ethers";
import { IDENTITYNFT_ABI, IDENTITYNFT_ADDRESS } from "../config";
import axios from "axios";

const IdentityForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    role: "0",
    recipient: "", 
    file: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setFormData({ ...formData, file: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const uploadToIPFS = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("http://localhost:5000/upload", formData);

      if (response.data.IpfsHash) {
        console.log("IPFS Hash received:", response.data.IpfsHash);
        return response.data.IpfsHash;
      } else {
        throw new Error("IPFS Hash not received in response");
      }
    } catch (error) {
      console.error("Error uploading to backend:", error);
      throw new Error("Failed to upload to IPFS");
    }
  };

  const mintIdentity = async () => {
    try {
      setLoading(true);
      setError("");
  
      if (!window.ethereum) throw new Error("Please install MetaMask");
  
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
  
      const contract = new ethers.Contract(IDENTITYNFT_ADDRESS, IDENTITYNFT_ABI, signer);
  
      const contractOwner = await contract.owner();
      if (userAddress.toLowerCase() !== contractOwner.toLowerCase()) {
        alert("Only the contract owner can mint Identity NFTs.");
        return;
      }
  
      const recipient = formData.recipient.trim();
      if (!ethers.isAddress(recipient)) {
        alert("Invalid recipient wallet address.");
        return;
      }
  
      const ipfsCid = await uploadToIPFS(formData.file);
  
      console.log("Calling smart contract with:");
      console.log("Recipient:", recipient);
      console.log("Name:", formData.name);
      console.log("DOB:", formData.dob);
      console.log("Role:", formData.role);
      console.log("IPFS CID:", ipfsCid);
  
      const tx = await contract.mintIdentity(
        recipient,
        formData.name,
        formData.dob,
        formData.role,
        ipfsCid
      );
      console.log("⏳ Transaction sent. Waiting for confirmation...");
      await tx.wait();
      console.log("Transaction confirmed!");
  
      alert("Identity NFT Minted!");
    } catch (err) {
      console.error("Error during minting:", err);
  
      if (
        err.code === "CALL_EXCEPTION" ||
        err.message.includes("missing revert data")
      ) {
        setError("This address already has an Identity NFT.");
      } else if (err.message.includes("execution reverted")) {
        setError("Smart contract reverted the transaction.");
      } else {
        setError(" " + (err.message || "Transaction failed."));
      }
    } finally {
      setLoading(false);
    }
  };  

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4">
        <h2 className="mb-4 text-center">🪪 Mint Identity NFT</h2>

        <div className="mb-3">
          <label className="form-label">Recipient Wallet Address</label>
          <input
            name="recipient"
            className="form-control"
            placeholder="0x..."
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input
            name="name"
            className="form-control"
            placeholder="John Doe"
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Date of Birth</label>
          <input
            name="dob"
            type="date"
            className="form-control"
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Role</label>
          <select name="role" className="form-select" onChange={handleChange}>
            <option value="0">Student</option>
            <option value="1">Professor</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Upload Government ID (PDF, JPG, etc.)</label>
          <input
            type="file"
            name="file"
            className="form-control"
            onChange={handleChange}
          />
        </div>

        <button
          className="btn btn-primary w-100"
          onClick={mintIdentity}
          disabled={loading}
        >
          {loading ? "Minting..." : "Mint Identity"}
        </button>

        {error && <div className="text-danger mt-3">{error}</div>}
      </div>
    </div>
  );
};

export default IdentityForm;