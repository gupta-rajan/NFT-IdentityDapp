import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { FEEPAYMENT_ABI, FEEPAYMENT_ADDRESS } from "../config";
import { FaTools, FaSyncAlt } from "react-icons/fa";

const FeeControl = () => {
  const [adminAddress, setAdminAddress] = useState("");
  const [currentFee, setCurrentFee] = useState("");
  const [newFeeAmount, setNewFeeAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setAdminAddress(address);
  };

  const fetchFeeAmount = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(FEEPAYMENT_ADDRESS, FEEPAYMENT_ABI, provider);

      const currentFeeAmount = await contract.feeAmount();
      setCurrentFee(ethers.formatEther(currentFeeAmount));
    } catch (err) {
      console.error("Error fetching current fee:", err);
      setError("Unable to fetch current fee.");
    }
    setLoading(false);
  };

  const handleSetFee = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(FEEPAYMENT_ADDRESS, FEEPAYMENT_ABI, signer);

      const tx = await contract.setFee(ethers.parseEther(newFeeAmount));
      await tx.wait();
      alert("Fee updated successfully!");
      fetchFeeAmount();
    } catch (err) {
      console.error("Set fee error:", err);
      alert("Error setting fee");
    }
  };

  const handleResetFees = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(FEEPAYMENT_ADDRESS, FEEPAYMENT_ABI, signer);

      const tx = await contract.resetFees(ethers.parseEther(newFeeAmount));
      await tx.wait();
      alert("Fees reset successfully and new cycle started!");
      fetchFeeAmount();
    } catch (err) {
      console.error("Reset fee error:", err);
      alert("Error resetting fee");
    }
  };

  useEffect(() => {
    connectWallet();
    fetchFeeAmount();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">⚙️ Admin Fee Controls</h2>

      <div className="card p-4 shadow">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {error && <p className="text-danger">{error}</p>}
            <p>
              <strong>Admin Wallet:</strong> {adminAddress}
            </p>
            <p>
              <strong>Current Semester Fee:</strong> {currentFee} ETH
            </p>

            <div className="mt-3">
              <input
                type="number"
                placeholder="New Fee in ETH"
                value={newFeeAmount}
                onChange={(e) => setNewFeeAmount(e.target.value)}
                className="form-control mb-3"
              />
              <button className="btn btn-primary me-2" onClick={handleSetFee}>
                <FaTools className="me-1" /> Set Fee
              </button>
              <button className="btn btn-danger" onClick={handleResetFees}>
                <FaSyncAlt className="me-1" /> Reset for New Semester
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FeeControl;