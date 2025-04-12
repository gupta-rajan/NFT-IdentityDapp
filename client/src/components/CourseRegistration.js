import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  COURSEREGISTRATION_ABI,
  COURSEREGISTRATION_ADDRESS,
  IDENTITYNFT_ABI,
  IDENTITYNFT_ADDRESS,
  FEEPAYMENT_ABI,
  FEEPAYMENT_ADDRESS,
} from "../config";
import { Web3Provider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";

const CourseRegistration = () => {
  const [courses, setCourses] = useState([]);
  const [userAddress, setUserAddress] = useState("");
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registeredCourses, setRegisteredCourses] = useState([]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }

    const provider = new Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    setUserAddress(address);
    setIsWalletConnected(true);
  };

  const fetchCourses = async () => {
    const provider = new Web3Provider(window.ethereum);
    const contract = new Contract(
      COURSEREGISTRATION_ADDRESS,
      COURSEREGISTRATION_ABI,
      provider
    );

    try {
      const courseCount = await contract.currentCourseId();
      let courseList = [];
      for (let i = 1; i <= courseCount; i++) {
        const course = await contract.courses(i);
        courseList.push({
          courseId: course.courseId.toNumber(),
          courseName: course.courseName,
          isActive: course.isActive,
        });
      }
      setCourses(courseList);
    } catch (err) {
      setError("Error fetching courses.");
      console.error(err);
    }
  };

  const fetchRegisteredCourses = async (courseList = courses) => {
    if (!userAddress || courseList.length === 0) return;

    const provider = new Web3Provider(window.ethereum);
    const contract = new Contract(
      COURSEREGISTRATION_ADDRESS,
      COURSEREGISTRATION_ABI,
      provider
    );

    try {
      const userRegistered = {};
      for (let i = 0; i < courseList.length; i++) {
        const isRegistered = await contract.isRegistered(
          courseList[i].courseId,
          userAddress
        );
        if (isRegistered) {
          userRegistered[courseList[i].courseId] = true;
        }
      }
      setRegisteredCourses(userRegistered);
    } catch (err) {
      console.error("Error fetching registered courses:", err);
    }
  };

  const registerForCourse = async (courseId) => {
    if (!userAddress) {
      alert("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const provider = new Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new Contract(
        COURSEREGISTRATION_ADDRESS,
        COURSEREGISTRATION_ABI,
        signer
      );
      const identityContract = new Contract(
        IDENTITYNFT_ADDRESS,
        IDENTITYNFT_ABI,
        signer
      );
      const feeContract = new Contract(
        FEEPAYMENT_ADDRESS,
        FEEPAYMENT_ABI,
        signer
      );

      const isIdentityValid = await identityContract.identityTokenByOwner(
        userAddress
      );
      if (isIdentityValid.toString() === "0") {
        alert("No valid Identity NFT found");
        return;
      }

      const isFeePaid = await feeContract.isFeePaid(userAddress);
      if (!isFeePaid) {
        alert("Fee not paid for course registration");
        return;
      }

      const tx = await contract.registerCourse(courseId);
      await tx.wait();
      alert("Successfully registered for the course!");

      await fetchCourses();
      await fetchRegisteredCourses();
    } catch (err) {
      console.error("Error registering for course:", err);
      const message =
        err?.data?.message || err?.error?.message || err?.message || "";

      if (message.includes("Already registered for this course")) {
        alert("You are already registered for this course.");
      } else {
        alert("Registration failed. Please try again.");
      }

      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isWalletConnected) {
      fetchCourses();
    }
  }, [isWalletConnected]);

  useEffect(() => {
    if (courses.length > 0 && isWalletConnected) {
      fetchRegisteredCourses();
    }
  }, [courses, userAddress]);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📚 Course Registration</h2>

      {!isWalletConnected ? (
        <button onClick={connectWallet} className="btn btn-primary mb-4">
          Connect Wallet
        </button>
      ) : (
        <div className="alert alert-success">
          Wallet Connected: {userAddress}
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card p-4 shadow">
        <h4 className="mb-3">Available Courses</h4>
        {loading && <div>Loading...</div>}
        {!loading && courses.length === 0 && <div>No courses available</div>}

        <table className="table table-bordered">
          <thead>
            <tr>
              <th>#</th>
              <th>Course Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course, index) => {
              const isAlreadyRegistered = registeredCourses[course.courseId];
              return (
                <tr key={index}>
                  <td>{course.courseId}</td>
                  <td>{course.courseName}</td>
                  <td>
                    {isAlreadyRegistered ? (
                      <span className="badge bg-success">
                        Already Registered
                      </span>
                    ) : (
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => registerForCourse(course.courseId)}
                      >
                        Register
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseRegistration;
