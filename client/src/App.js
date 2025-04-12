import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ethers } from "ethers";
import IdentityForm from "./components/IdentityForm";
import Dashboard from "./components/Dashboard";
import Navbar from "./components/NavBar";
import CourseRegistration from "./components/CourseRegistration";
import AddCourse from "./components/AddCourse";
import PayFee from "./components/PayFee";
import CertificateForm from "./components/CertificateForm";
import Certificates from "./components/Certificates";
import AmenityAccess from "./components/AmenityAccess";
import { IDENTITYNFT_ABI, IDENTITYNFT_ADDRESS } from "./config";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userAddress, setUserAddress] = useState("");

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddr = await signer.getAddress();
        setUserAddress(userAddr);

        const contract = new ethers.Contract(
          IDENTITYNFT_ADDRESS,
          IDENTITYNFT_ABI,
          signer
        );

        const tokenId = await contract.identityTokenByOwner(userAddr);
        if (tokenId > 0) {
          const identity = await contract.identities(tokenId);
          // Role.Admin = 2
          setIsAdmin(identity.role.toString() === "2");
        }
      } catch (err) {
        console.error("Error checking admin role:", err);
      }
    };

    checkAdminStatus();
  }, []);

  return (
    <Router>
      <Navbar isAdmin={isAdmin} />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/course-registration" element={<CourseRegistration />} />
        <Route path="/pay-fee" element={<PayFee />} />

        {/* Admin Only Routes */}
        <Route
          path="/add-course"
          element={isAdmin ? <AddCourse /> : <Navigate to="/" />}
        />
        <Route
          path="/identity"
          element={isAdmin ? <IdentityForm /> : <Navigate to="/" />}
        />
        <Route
          path="/certificates-form"
          element={isAdmin ? <CertificateForm /> : <Navigate to="/" />}
        />

        {/* Public Routes */}
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/amenities" element={<AmenityAccess />} />
      </Routes>
    </Router>
  );
}

export default App;