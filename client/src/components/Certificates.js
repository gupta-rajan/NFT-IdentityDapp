import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CERTIFICATENFT_ABI, CERTIFICATENFT_ADDRESS } from "../config";
import { FaLink } from "react-icons/fa";

const Certificates = () => {
  const [userAddress, setUserAddress] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setUserAddress(address);
  };

  const fetchCertificates = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CERTIFICATENFT_ADDRESS,
        CERTIFICATENFT_ABI,
        provider
      );

      const tokenIds = await contract.listCertificates(userAddress);
      const certs = await Promise.all(
        tokenIds.map(async (id) => {
          const cert = await contract.certificates(id);
          return {
            id: id.toString(),
            courseId: cert.courseId.toString(),
            certificateType: cert.certificateType,
            ipfsFileId: cert.ipfsFileId,
          };
        })
      );

      setCertificates(certs);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch certificates:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    connectWallet();
  }, []);

  useEffect(() => {
    if (userAddress) {
      fetchCertificates();
    }
  }, [userAddress]);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📜 Your Certificates</h2>

      {loading ? (
        <p>Loading certificates...</p>
      ) : certificates.length === 0 ? (
        <p>No certificates issued yet.</p>
      ) : (
        <div className="row">
          {certificates.map((cert, index) => (
            <div className="col-md-6 mb-3" key={index}>
              <div className="card p-3 shadow-sm">
                <p>
                  <strong>Certificate ID:</strong> {cert.id}
                </p>
                <p>
                  <strong>Course ID:</strong>{" "}
                  {cert.courseId === "0" ? "Degree Certificate" : cert.courseId}
                </p>
                <p>
                  <strong>Type:</strong> {cert.certificateType}
                </p>
                <a
                  href={`https://ipfs.io/ipfs/${cert.ipfsFileId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-primary"
                >
                  <FaLink className="me-1" />
                  View Certificate
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Certificates;