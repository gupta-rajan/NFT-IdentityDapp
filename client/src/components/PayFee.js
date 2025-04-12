import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { FEEPAYMENT_ABI, FEEPAYMENT_ADDRESS } from "../config"; // Add these values to config
import { FaCheckCircle, FaTimesCircle, FaWallet } from "react-icons/fa";

const PayFee = () => {
  const [userAddress, setUserAddress] = useState("");
  const [feeAmount, setFeeAmount] = useState(0);
  const [isFeePaid, setIsFeePaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setUserAddress(address);
  };

  const fetchFeeAmount = async () => {
    try {
      if (!userAddress) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(FEEPAYMENT_ADDRESS, FEEPAYMENT_ABI, provider);

      // Fetch the current fee amount
      const currentFeeAmount = await contract.feeAmount();
      setFeeAmount(ethers.formatEther(currentFeeAmount)); // Convert from wei to ether

      // Check if the fee has already been paid for the current cycle
      const paidStatus = await contract.isFeePaid(userAddress);
      setIsFeePaid(paidStatus);
    } catch (err) {
      console.error("Error fetching fee data:", err);
      setError("Unable to fetch fee data.");
    }
    setLoading(false);
  };

  const payFee = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(FEEPAYMENT_ADDRESS, FEEPAYMENT_ABI, signer);

    try {
      setLoading(true);
      // Pay the exact fee amount
      const tx = await contract.payFee({
        value: ethers.parseEther(feeAmount.toString()), // Convert feeAmount to wei
      });

      // Wait for the transaction to be confirmed
      await tx.wait();
      alert("Fee paid successfully!");
      fetchFeeAmount(); // Re-fetch fee amount and payment status
    } catch (err) {
      console.error("Payment failed:", err);
      setError("Payment failed. Please try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    connectWallet();
  }, []);

  useEffect(() => {
    if (userAddress) {
      fetchFeeAmount();
    }
  }, [userAddress]);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">💸 Pay Fees</h2>

      <div className="card p-4 shadow">
        {loading ? (
          <p>Loading fee details...</p>
        ) : (
          <>
            {error && <p className="text-danger">{error}</p>}
            <p>
              <strong>Connected Wallet:</strong> {userAddress}
            </p>
            <p>
              <strong>Current Fee for Semester:</strong> {feeAmount} ETH
            </p>
            <p>
              <strong>Fee Status: </strong>
              {isFeePaid ? (
                <span className="badge bg-success">
                  <FaCheckCircle /> Fee Paid
                </span>
              ) : (
                <span className="badge bg-danger">
                  <FaTimesCircle /> Fee Not Paid
                </span>
              )}
            </p>

            {/* Payment Button */}
            {!isFeePaid && (
              <div className="mt-4">
                <button className="btn btn-outline-primary" onClick={payFee}>
                  <FaWallet className="me-2" /> Pay Fee
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PayFee;