import React, { useState } from "react";
import { ethers } from "ethers";
import { CERTIFICATENFT_ABI, CERTIFICATENFT_ADDRESS } from "../config";
import axios from "axios";

const CertificateForm = () => {
  const [formData, setFormData] = useState({
    courseId: "",
    certificateType: "Course Completion",
    file: null,
    recipient: "",
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

  const issueCertificate = async () => {
    try {
      setLoading(true);
      setError("");

      if (!window.ethereum) throw new Error("Please install MetaMask");

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const contract = new ethers.Contract(
        CERTIFICATENFT_ADDRESS,
        CERTIFICATENFT_ABI,
        signer
      );

      // Ensure the user is authorized (only owner can mint certificates)
      const contractOwner = await contract.owner();
      if (userAddress.toLowerCase() !== contractOwner.toLowerCase()) {
        alert("❌ Only the contract owner can issue certificates.");
        return;
      }

      const recipient = formData.recipient.trim();
      if (!ethers.isAddress(recipient)) {
        alert("❌ Invalid recipient wallet address.");
        return;
      }

      const ipfsCid = await uploadToIPFS(formData.file);

      console.log("Calling smart contract with:");
      console.log("Recipient:", recipient);
      console.log("Course ID:", formData.courseId);
      console.log("Certificate Type:", formData.certificateType);
      console.log("IPFS CID:", ipfsCid);

      const tx = await contract.mintCertificate(
        recipient,
        formData.courseId,
        formData.certificateType,
        ipfsCid
      );
      console.log("Transaction sent. Waiting for confirmation...");
      await tx.wait();
      console.log("Transaction confirmed!");

      alert("Certificate NFT Issued!");
    } catch (err) {
      console.error("Error during issuing:", err);

      setError(" " + (err.message || "Transaction failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4">
        <h2 className="mb-4 text-center">🎓 Issue Certificate NFT</h2>

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
          <label className="form-label">Course ID</label>
          <input
            name="courseId"
            type="number"
            className="form-control"
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Certificate Type</label>
          <select
            name="certificateType"
            className="form-select"
            onChange={handleChange}
          >
            <option value="Course Completion">Course Completion</option>
            <option value="Degree">Degree</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Upload Certificate Document (PDF, JPG, etc.)</label>
          <input
            type="file"
            name="file"
            className="form-control"
            onChange={handleChange}
          />
        </div>

        <button
          className="btn btn-primary w-100"
          onClick={issueCertificate}
          disabled={loading}
        >
          {loading ? "Issuing..." : "Issue Certificate"}
        </button>

        {error && <div className="text-danger mt-3">{error}</div>}
      </div>
    </div>
  );
};

export default CertificateForm;