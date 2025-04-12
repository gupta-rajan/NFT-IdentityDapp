import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  IDENTITYNFT_ABI,
  IDENTITYNFT_ADDRESS,
  COURSEREGISTRATION_ABI,
  COURSEREGISTRATION_ADDRESS,
  CERTIFICATENFT_ABI,
  CERTIFICATENFT_ADDRESS,
} from "../config";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaLink,
  FaUserShield,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [userAddress, setUserAddress] = useState("");
  const [identityData, setIdentityData] = useState(null);
  const [error, setError] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [issuedCertificates, setIssuedCertificates] = useState([]);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setUserAddress(address);
  };

  const fetchIdentity = async () => {
    try {
      if (!userAddress) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        IDENTITYNFT_ADDRESS,
        IDENTITYNFT_ABI,
        provider
      );

      const tokenId = await contract.identityTokenByOwner(userAddress);

      if (tokenId === 0) {
        setError("No Identity NFT found for this address.");
        return;
      }

      const identity = await contract.identities(tokenId);

      setIdentityData({
        name: identity.name,
        dob: identity.dateOfBirth,
        role: identity.role.toString(), // "0", "1", or "2"
        ipfsHash: identity.ipfsFileId,
      });
    } catch (err) {
      console.error("Error fetching identity:", err);
      setError("Identity NFT not found or unable to fetch data.");
    }
  };

  const checkOwner = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();

    const contract = new ethers.Contract(
      COURSEREGISTRATION_ADDRESS,
      COURSEREGISTRATION_ABI,
      provider
    );
    const contractOwner = await contract.owner();

    setIsOwner(contractOwner.toLowerCase() === signerAddress.toLowerCase());
    setLoading(false);
  };

  const fetchIssuedCertificates = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CERTIFICATENFT_ADDRESS,
        CERTIFICATENFT_ABI,
        provider
      );

      const tokenIds = await contract.listCertificates(userAddress);
      if (tokenIds.length === 0) {
        setIssuedCertificates([]);
        return;
      }

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

      setIssuedCertificates(certs);
    } catch (err) {
      console.error("Error fetching certificates:", err);
      setError("Unable to fetch issued certificates.");
    }
  };

  useEffect(() => {
    connectWallet();
  }, []);

  useEffect(() => {
    if (userAddress) {
      fetchIdentity();
      checkOwner();
      fetchIssuedCertificates();
    }
  }, [userAddress]);

  const getRoleBadge = (role) => {
    switch (role) {
      case "0":
        return (
          <span className="badge bg-primary">
            <FaUserGraduate /> Student
          </span>
        );
      case "1":
        return (
          <span className="badge bg-success">
            <FaChalkboardTeacher /> Professor
          </span>
        );
      case "2":
        return (
          <span className="badge bg-danger">
            <FaUserShield /> Admin
          </span>
        );
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">👤 Dashboard</h2>

      <div className="card p-4 shadow">
        <p>
          <strong>Connected Wallet:</strong> {userAddress || "Not Connected"}
        </p>

        {identityData ? (
          <>
            <h5 className="mt-3">Your Identity NFT Summary</h5>
            <hr />
            <p>
              <strong>Name:</strong> {identityData.name}
            </p>
            <p>
              <strong>Date of Birth:</strong> {identityData.dob}
            </p>
            <p>
              <strong>Role:</strong> {getRoleBadge(identityData.role)}
            </p>
            <p>
              <strong>ID File:</strong>{" "}
              <a
                href={`https://ipfs.io/ipfs/${identityData.ipfsHash}`}
                target="_blank"
                rel="noreferrer"
              >
                <FaLink className="me-1" />
                View on IPFS
              </a>
            </p>

            <div className="mt-4">
              {identityData.role === "0" && (
                <>
                  <Link to="/pay-fee">
                    <button className="btn btn-outline-primary me-2">
                      💸 Pay Fees
                    </button>
                  </Link>
                  <Link to="/course-registration">
                    <button className="btn btn-outline-secondary me-2">
                      📚 Register Courses
                    </button>
                  </Link>
                  <Link to="/amenities">
                    <button className="btn btn-outline-warning">
                      🏫 Access Amenities
                    </button>
                  </Link>
                  {loading ? (
                    <div>Loading...</div>
                  ) : (
                    isOwner && (
                      <div className="mt-4">
                        <Link to="/add-course">
                          <button className="btn btn-outline-info">
                            ➕ Add New Course
                          </button>
                        </Link>
                      </div>
                    )
                  )}
                  {issuedCertificates.length > 0 && (
                    <div className="mt-4">
                      <Link to="/certificates">
                        <button className="btn btn-outline-info">
                          📜 View Issued Certificates
                        </button>
                      </Link>
                    </div>
                  )}
                </>
              )}

              {identityData.role === "1" && (
                <button className="btn btn-outline-success" disabled>
                  🪪 Issue Certificates
                </button>
              )}

              {identityData.role === "2" && (
                <>
                  <Link to="/identity">
                    <button className="btn btn-outline-dark me-2">
                      🪪 Issue Identity NFT
                    </button>
                  </Link>
                  <Link to="/add-course">
                    <button className="btn btn-outline-info me-2">
                      ➕ Add New Course
                    </button>
                  </Link>
                  <Link to="/certificates-form">
                    <button className="btn btn-outline-success me-2">
                      📜 Issue Certificate
                    </button>
                  </Link>
                  <Link to="/certificates">
                    <button className="btn btn-outline-info me-2">
                      📑 View All Certificates
                    </button>
                  </Link>
                </>
              )}
            </div>
          </>
        ) : (
          <p className="text-danger mt-3">
            {error || "Fetching identity data..."}
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;